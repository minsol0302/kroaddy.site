"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { createMarkerTooltipContent } from "./MarkerTooltip";
import { Location } from "../lib/types";
import { keywordPlaceMap } from "../lib/keywordPlaces";

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  route?: Location[];
  searchKeyword?: string;
  onPlaceClick?: (place: Location) => void;
  resetKey?: number; // 초기화를 위한 키
  drawRouteKey?: number; // 경로를 그릴지 말지 제어하는 키
}

// 전역으로 onPlaceClick 저장 (이벤트 핸들러에서 접근하기 위해)
let globalOnPlaceClick: ((place: Location) => void) | undefined = undefined;


export default function KakaoMapPage({ route = [], searchKeyword = '', onPlaceClick, resetKey = 0, drawRouteKey = 0 }: KakaoMapProps) {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  // 마커 hover tooltip 저장
  const markerTooltipsRef = useRef<Map<any, any>>(new Map());
  // 키워드 검색으로 생성된 마커 (route와 별도 관리)
  const searchMarkersRef = useRef<any[]>([]);
  // 현재 위치 마커 및 원형 오버레이
  const currentLocationMarkerRef = useRef<any>(null);
  const currentLocationCircleRef = useRef<any>(null);
  // 현재 위치 좌표 저장
  const currentLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  // 경로 Polyline 저장
  const routePolylineRef = useRef<any>(null);

  const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;


  // onPlaceClick을 전역에 저장 (이벤트 핸들러에서 접근하기 위해)
  useEffect(() => {
    globalOnPlaceClick = onPlaceClick;
  }, [onPlaceClick]);

  // 기존 마커와 tooltip 제거 (route 기반만)
  const clearOverlays = () => {
    markersRef.current.forEach((marker) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];

    // tooltip 제거
    markerTooltipsRef.current.forEach((tooltip) => {
      if (tooltip) tooltip.setMap(null);
    });
    markerTooltipsRef.current.clear();
  };


  // 키워드 검색으로 생성된 마커 제거
  const clearSearchMarkers = () => {
    searchMarkersRef.current.forEach((marker) => {
      if (marker) {
        marker.setMap(null);
        // 검색 마커의 tooltip도 제거
        const tooltip = markerTooltipsRef.current.get(marker);
        if (tooltip) {
          tooltip.setMap(null);
          markerTooltipsRef.current.delete(marker);
        }
      }
    });
    searchMarkersRef.current = [];
  };

  // 현재 위치 마커 제거
  const clearCurrentLocationMarker = () => {
    if (currentLocationMarkerRef.current) {
      // CustomOverlay인 경우
      if (currentLocationMarkerRef.current.setMap) {
        currentLocationMarkerRef.current.setMap(null);
      }
      currentLocationMarkerRef.current = null;
    }
    if (currentLocationCircleRef.current) {
      if (currentLocationCircleRef.current.setMap) {
        currentLocationCircleRef.current.setMap(null);
      }
      currentLocationCircleRef.current = null;
    }
  };

  // 경로 그리기 (현재 위치에서 route의 장소들까지)
  const drawRoute = (map: any) => {
    // 기존 경로 제거
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    // 현재 위치와 route가 모두 있어야 경로를 그릴 수 있음
    if (!currentLocationRef.current || !route || route.length === 0) {
      return;
    }

    // route를 order 순서대로 정렬 (order가 없으면 기존 순서 유지)
    const sortedRoute = [...route].sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : Infinity;
      const orderB = b.order !== undefined ? b.order : Infinity;
      return orderA - orderB;
    });

    // 경로 좌표 배열 생성 (현재 위치 -> route의 각 장소)
    const path: any[] = [];

    // 현재 위치를 시작점으로 추가
    path.push(new window.kakao.maps.LatLng(
      currentLocationRef.current.lat,
      currentLocationRef.current.lng
    ));

    // 정렬된 route의 각 장소를 순서대로 추가
    sortedRoute.forEach((location) => {
      path.push(new window.kakao.maps.LatLng(location.lat, location.lng));
    });

    // Polyline으로 경로 그리기
    const polyline = new window.kakao.maps.Polyline({
      path: path,
      strokeWeight: 5,
      strokeColor: '#4285F4',
      strokeOpacity: 0.7,
      strokeStyle: 'solid',
    });

    polyline.setMap(map);
    routePolylineRef.current = polyline;

    // 지도 범위를 현재 위치와 모든 장소를 포함하도록 조정
    const bounds = new window.kakao.maps.LatLngBounds();
    bounds.extend(new window.kakao.maps.LatLng(
      currentLocationRef.current.lat,
      currentLocationRef.current.lng
    ));
    sortedRoute.forEach((location) => {
      bounds.extend(new window.kakao.maps.LatLng(location.lat, location.lng));
    });
    map.setBounds(bounds);
  };

  // 현재 위치 가져오기 및 지도에 표시
  const setCurrentLocation = (map: any) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const currentPosition = new window.kakao.maps.LatLng(lat, lng);

        // 현재 위치 좌표 저장
        currentLocationRef.current = { lat, lng };

        // 지도 중심을 현재 위치로 이동
        map.setCenter(currentPosition);
        map.setLevel(3); // 좀 더 가까운 레벨로 설정

        // 기존 현재 위치 마커 제거
        clearCurrentLocationMarker();

        // 현재 위치에 원형 오버레이 추가 (반경 표시)
        const circle = new window.kakao.maps.Circle({
          center: currentPosition,
          radius: 50, // 50미터 반경
          strokeWeight: 2,
          strokeColor: '#4285F4',
          strokeOpacity: 0.6,
          fillColor: '#4285F4',
          fillOpacity: 0.15,
        });
        circle.setMap(map);
        currentLocationCircleRef.current = circle;

        // 현재 위치 마커 생성 (SVG로 파란색 원형 마커 생성)
        const markerContent = `
          <div style="
            width: 20px;
            height: 20px;
            background-color: #4285F4;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          "></div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: currentPosition,
          content: markerContent,
          yAnchor: 0.5,
          xAnchor: 0.5,
        });
        customOverlay.setMap(map);

        // 마커 참조 저장 (CustomOverlay를 마커처럼 사용)
        currentLocationMarkerRef.current = customOverlay;

        // 경로 그리기 (route가 있으면)
        if (route && route.length > 0) {
          drawRoute(map);
        }
      },
      (error) => {
        console.warn('Error getting current location:', error);
        // 위치를 가져오지 못하면 기본 위치(서울시청) 사용
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // route에 따라 마커와 오버레이 생성 (오버레이는 숨김 상태)
  const createOverlays = (map: any) => {
    if (!route || route.length === 0) return;

    const places = new window.kakao.maps.services.Places();

    route.forEach((location) => {
      // 카카오맵 Places API로 장소명으로 검색하여 좌표 가져오기
      const searchPlaceAndCreateMarker = () => {
        // 장소명으로 검색 (keywordPlaces.ts의 name 사용)
        places.keywordSearch(location.name, (data: any, status: any) => {
          let apiPlaceInfo: any = null;
          let markerPosition: { lat: number; lng: number } = { lat: location.lat, lng: location.lng };

          if (status === window.kakao.maps.services.Status.OK && data && data.length > 0) {
            // 1순위: 장소명이 정확히 일치하는 것 찾기
            const exactMatch = data.find((place: any) => {
              return place.place_name === location.name ||
                place.place_name.replace(/\s/g, '') === location.name.replace(/\s/g, '');
            });

            if (exactMatch) {
              apiPlaceInfo = exactMatch;
              markerPosition = {
                lat: parseFloat(exactMatch.y),
                lng: parseFloat(exactMatch.x)
              };
            } else {
              // 2순위: 장소명이 포함되는 것 중에서 좌표가 가장 가까운 것 찾기
              const matchingPlaces = data.filter((place: any) => {
                return place.place_name.includes(location.name) ||
                  location.name.includes(place.place_name);
              });

              if (matchingPlaces.length > 0) {
                let nearestPlace = matchingPlaces[0];
                let minDistance = Infinity;

                matchingPlaces.forEach((place: any) => {
                  const placeLat = parseFloat(place.y);
                  const placeLng = parseFloat(place.x);
                  const distance = Math.sqrt(
                    Math.pow(placeLat - location.lat, 2) +
                    Math.pow(placeLng - location.lng, 2)
                  );

                  if (distance < minDistance && distance < 0.01) { // 약 1km 이내
                    minDistance = distance;
                    nearestPlace = place;
                  }
                });

                if (minDistance < Infinity) {
                  apiPlaceInfo = nearestPlace;
                  markerPosition = {
                    lat: parseFloat(nearestPlace.y),
                    lng: parseFloat(nearestPlace.x)
                  };
                }
              } else {
                // 3순위: 모든 결과 중에서 좌표가 가장 가까운 것 찾기
                let nearestPlace = data[0];
                let minDistance = Infinity;

                data.forEach((place: any) => {
                  const placeLat = parseFloat(place.y);
                  const placeLng = parseFloat(place.x);
                  const distance = Math.sqrt(
                    Math.pow(placeLat - location.lat, 2) +
                    Math.pow(placeLng - location.lng, 2)
                  );

                  if (distance < minDistance && distance < 0.01) { // 약 1km 이내
                    minDistance = distance;
                    nearestPlace = place;
                  }
                });

                if (minDistance < Infinity) {
                  apiPlaceInfo = nearestPlace;
                  markerPosition = {
                    lat: parseFloat(nearestPlace.y),
                    lng: parseFloat(nearestPlace.x)
                  };
                }
              }
            }
          }

          // API에서 가져온 정보로 Location 객체 생성
          const finalLocation: Location = apiPlaceInfo ? {
            ...location,
            lat: markerPosition.lat,
            lng: markerPosition.lng,
            name: apiPlaceInfo.place_name || location.name,
            address: apiPlaceInfo.road_address_name || apiPlaceInfo.address_name || location.address,
            category: apiPlaceInfo.category_name || location.category,
            phone: apiPlaceInfo.phone || location.phone,
            placeUrl: apiPlaceInfo.place_url || location.placeUrl,
          } : location;

          // 카테고리 확인하여 마커 이미지 결정
          // 음식점 카테고리: FD6 또는 category_name에 "음식" 포함
          const categoryName = finalLocation.category || '';
          const categoryCode = apiPlaceInfo?.category_group_code || '';
          const isRestaurant = categoryCode === 'FD6' ||
            categoryName.includes('음식') ||
            categoryName.includes('식당') ||
            categoryName.includes('레스토랑') ||
            categoryName.includes('카페');

          // 마커 이미지 선택 (음식점: 빨간색, 그 외: 파란색)
          const markerImageSrc = isRestaurant ? '/img/marker-red.png' : '/img/marker-blue.png';

          // 이미지 로드하여 원본 비율 계산 후 마커 생성 (스타일 효과 적용)
          const img = new Image();
          img.onload = () => {
            // 원본 이미지의 가로세로 비율 유지
            const originalWidth = img.width;
            const originalHeight = img.height;
            const aspectRatio = originalWidth / originalHeight;

            // 표시할 높이 설정 (적절한 크기로 조정)
            const displayHeight = 40;
            const displayWidth = displayHeight * aspectRatio;

            // Canvas를 사용하여 이미지에 스타일 효과 적용
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // 그림자 공간을 포함한 캔버스 크기
            const shadowOffset = 2;
            const shadowBlur = 6;
            const padding = shadowBlur; // 그림자 공간만
            canvas.width = displayWidth + shadowOffset + padding * 2;
            canvas.height = displayHeight + shadowOffset + padding * 2;

            // 그림자 효과 설정 (더 연하게)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'; // 0.4 -> 0.2로 더 연하게
            ctx.shadowOffsetX = shadowOffset;
            ctx.shadowOffsetY = shadowOffset;
            ctx.shadowBlur = shadowBlur;

            // 이미지 그리기 (그림자 효과 포함)
            ctx.drawImage(
              img,
              padding,
              padding,
              displayWidth,
              displayHeight
            );

            // Canvas를 data URL로 변환
            const processedImageSrc = canvas.toDataURL('image/png');

            // 커스텀 마커 이미지 생성 (원본 비율 유지, 스타일 효과 적용)
            const markerImageSize = new window.kakao.maps.Size(
              displayWidth + shadowOffset + padding * 2,
              displayHeight + shadowOffset + padding * 2
            );
            const markerImageOption = {
              offset: new window.kakao.maps.Point(
                (displayWidth + shadowOffset + padding * 2) / 2,
                displayHeight + shadowOffset + padding * 2
              ) // 마커 이미지 중앙 정렬 (하단 기준)
            };
            const markerImage = new window.kakao.maps.MarkerImage(
              processedImageSrc, // 처리된 이미지 사용
              markerImageSize,
              markerImageOption
            );

            // API에서 가져온 좌표로 마커 생성 (커스텀 이미지 사용)
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(markerPosition.lat, markerPosition.lng),
              image: markerImage, // 커스텀 마커 이미지
              map: map,
            });
            markersRef.current.push(marker);

            // 마커 클릭 이벤트 - PlacePopup 열기
            window.kakao.maps.event.addListener(marker, "click", () => {
              if (globalOnPlaceClick) {
                globalOnPlaceClick(finalLocation);
              }
            });

            // Tooltip 생성 (API 정보 사용)
            const tooltipContent = createMarkerTooltipContent(finalLocation);
            const tooltipOverlay = new window.kakao.maps.CustomOverlay({
              position: new window.kakao.maps.LatLng(markerPosition.lat, markerPosition.lng),
              content: tooltipContent,
              yAnchor: 1.15, // 마커 위에 표시 (간격 조정)
              xAnchor: 0.5, // 중앙 정렬
              zIndex: 1000,
            });
            tooltipOverlay.setMap(null); // 초기에는 숨김
            markerTooltipsRef.current.set(marker, tooltipOverlay);

            // 마커에 mouseover 이벤트 추가 (마커 전체 영역)
            window.kakao.maps.event.addListener(marker, "mouseover", function () {
              // 다른 tooltip 모두 숨김
              markerTooltipsRef.current.forEach((tooltip) => {
                if (tooltip && tooltip !== tooltipOverlay) {
                  tooltip.setMap(null);
                }
              });

              // 현재 tooltip 표시
              if (tooltipOverlay) {
                tooltipOverlay.setMap(map);
              }
            });

            // 마커에 mouseout 이벤트 추가
            window.kakao.maps.event.addListener(marker, "mouseout", function () {
              // tooltip 숨김
              if (tooltipOverlay) {
                tooltipOverlay.setMap(null);
              }
            });
          };
          img.src = markerImageSrc;

          // 마커의 hover 이벤트는 이미 위에서 처리되므로 추가 DOM 조작 불필요
        });
      };

      // 장소명으로 API 검색 후 마커 생성
      searchPlaceAndCreateMarker();
    });

    // 마커가 비동기로 생성되므로 bounds 조정은 마커 생성 후에 처리
    // 각 마커 생성 시 bounds에 추가하도록 수정 필요 (현재는 기본 bounds 사용)
    setTimeout(() => {
      if (route.length > 0 && markersRef.current.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();

        // 현재 위치가 있으면 포함
        if (currentLocationRef.current) {
          bounds.extend(new window.kakao.maps.LatLng(
            currentLocationRef.current.lat,
            currentLocationRef.current.lng
          ));
        }

        // 생성된 마커들의 위치를 bounds에 추가
        markersRef.current.forEach((marker) => {
          if (marker && marker.getPosition) {
            bounds.extend(marker.getPosition());
          }
        });

        if (markersRef.current.length > 0) {
          map.setBounds(bounds);
        }
      }
    }, 1000); // 마커 생성 대기 시간
  };

  useEffect(() => {
    if (!KAKAO_MAP_API_KEY) return;

    const initMap = () => {
      if (!window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 기본값 (서울시청)
          level: 5,
        });
        mapRef.current = map;

        // 현재 위치 가져오기 및 지도에 표시
        setCurrentLocation(map);

        // 지도 클릭 이벤트
        window.kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {

          const latlng = mouseEvent.latLng;

          // 좌표로 주소 검색 및 주변 장소 검색
          const geocoder = new window.kakao.maps.services.Geocoder();
          const places = new window.kakao.maps.services.Places();

          // 주변 장소 검색 함수 (장소를 찾으면 true, 못 찾으면 false 반환)
          const searchNearbyPlace = (categories: string[], index: number, callback: (found: boolean, placeName?: string) => void) => {
            if (index >= categories.length) {
              // 모든 카테고리를 검색했는데 장소를 못 찾음
              callback(false);
              return;
            }

            places.categorySearch(categories[index], (data: any, searchStatus: any) => {
              if (searchStatus === window.kakao.maps.services.Status.OK && data.length > 0) {
                // 가장 가까운 장소 찾기
                let nearestPlace = null;
                let minDistance = Infinity;

                data.forEach((place: any) => {
                  const placeLat = parseFloat(place.y);
                  const placeLng = parseFloat(place.x);
                  const distance = Math.sqrt(
                    Math.pow(placeLat - latlng.getLat(), 2) +
                    Math.pow(placeLng - latlng.getLng(), 2)
                  );

                  if (distance < minDistance && distance < 0.0005) { // 약 50m 이내
                    minDistance = distance;
                    nearestPlace = place as any;
                  }
                });

                if (nearestPlace) {
                  // 장소를 찾았으면 이름 반환
                  callback(true, (nearestPlace as any).place_name);
                } else {
                  // 다음 카테고리 검색
                  searchNearbyPlace(categories, index + 1, callback);
                }
              } else {
                // 다음 카테고리 검색
                searchNearbyPlace(categories, index + 1, callback);
              }
            }, {
              location: latlng,
              radius: 100
            });
          };

          // 여러 카테고리 순차 검색 (음식점, 카페, 관광명소, 문화시설)
          const categories = ['FD6', 'CE7', 'AT4', 'CT1'];
          searchNearbyPlace(categories, 0, (found: boolean, placeName?: string) => {
            if (!found) {
              // 장소를 찾지 못했으면 마커를 생성하지 않음
              return;
            }

            // 장소를 찾았으면 PlacePopup 열기
            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].road_address || result[0].address;
                const addressName = addr?.road_address_name || addr?.address_name || "주소 검색 중...";

                const tempLocation: Location = {
                  id: `click-${Date.now()}`,
                  name: placeName || "장소",
                  address: addressName,
                  lat: latlng.getLat(),
                  lng: latlng.getLng(),
                };

                // PlacePopup 열기
                if (globalOnPlaceClick) {
                  globalOnPlaceClick(tempLocation);
                }

                map.panTo(latlng);
              }
            });
          });

          // 드래그 이벤트는 마커 생성 후에만 등록되므로 여기서는 처리하지 않음
          // 마커 생성 시점에 드래그 이벤트 리스너를 등록해야 함
        });

        // route가 있으면 오버레이 생성
        if (route && route.length > 0) {
          createOverlays(map);
        }
      });
    };

    if (window.kakao?.maps?.load) initMap();
    else {
      const handler = () => initMap();
      window.addEventListener("kakaoMapLoaded", handler);
      return () => window.removeEventListener("kakaoMapLoaded", handler);
    }
  }, [KAKAO_MAP_API_KEY]);

  // route 변경 시 오버레이 업데이트 (경로는 자동으로 그리지 않음)
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    clearOverlays();

    if (route && route.length > 0) {
      createOverlays(mapRef.current);
      // 경로는 "응" 입력 시에만 그리도록 함 (자동으로 그리지 않음)
    } else {
      // route가 비어있으면 경로 제거
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
        routePolylineRef.current = null;
      }
    }
  }, [route]);

  // resetKey 변경 시 모든 마커와 오버레이 초기화
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    clearOverlays();
    clearSearchMarkers();
    // 경로 제거
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
    // 현재 위치는 유지 (초기화하지 않음)
  }, [resetKey]);

  // drawRouteKey 변경 시 경로 그리기 ("응" 입력 시에만 경로를 그리도록 함)
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;
    if (drawRouteKey === 0) return; // 초기값이면 경로를 그리지 않음

    // 현재 위치와 route가 모두 있으면 경로 그리기
    if (currentLocationRef.current && route && route.length > 0) {
      drawRoute(mapRef.current);
    }
  }, [drawRouteKey, route]);

  // 키워드 검색 처리 (카카오맵 API 기본 방식)
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) {
      return;
    }

    // searchKeyword가 비어있으면 기존 검색 마커만 제거
    if (!searchKeyword.trim()) {
      clearSearchMarkers();
      return;
    }

    const map = mapRef.current;
    const places = new window.kakao.maps.services.Places();
    const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });

    // 기존 검색 마커 제거
    clearSearchMarkers();

    // 마커 표시 함수 (Location 타입 또는 Places API 결과 모두 처리)
    const displayMarkerFromLocation = (location: Location) => {
      // 마커 생성 및 지도에 표시
      const marker = new window.kakao.maps.Marker({
        map: map,
        position: new window.kakao.maps.LatLng(location.lat, location.lng)
      });

      searchMarkersRef.current.push(marker);

      // Tooltip 생성
      const tooltipContent = createMarkerTooltipContent(location);
      const tooltipOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(location.lat, location.lng),
        content: tooltipContent,
        yAnchor: 1.15, // 마커 위에 표시 (간격 조정)
        xAnchor: 0.5, // 중앙 정렬
        zIndex: 1000,
      });
      tooltipOverlay.setMap(null); // 초기에는 숨김
      markerTooltipsRef.current.set(marker, tooltipOverlay);

      // 마커에 mouseover 이벤트 추가
      window.kakao.maps.event.addListener(marker, "mouseover", function () {
        // 다른 tooltip 모두 숨김
        markerTooltipsRef.current.forEach((tooltip) => {
          if (tooltip && tooltip !== tooltipOverlay) {
            tooltip.setMap(null);
          }
        });

        // 현재 tooltip 표시
        if (tooltipOverlay) {
          tooltipOverlay.setMap(map);
        }
      });

      // 마커에 mouseout 이벤트 추가
      window.kakao.maps.event.addListener(marker, "mouseout", function () {
        // tooltip 숨김
        if (tooltipOverlay) {
          tooltipOverlay.setMap(null);
        }
      });

      // 마커 클릭 이벤트 등록
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 인포윈도우에 장소명 표시
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + location.name + '</div>');
        infowindow.open(map, marker);

        // PlacePopup도 열기
        if (globalOnPlaceClick) {
          globalOnPlaceClick(location);
        }
      });
    };

    // Places API 결과를 Location으로 변환하는 함수
    const displayMarkerFromPlace = (place: any) => {
      const location: Location = {
        id: place.id || `search-${Date.now()}`,
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
        phone: place.phone,
        category: place.category_name,
        placeUrl: place.place_url
      };
      displayMarkerFromLocation(location);
    };

    // 키워드에 '근처'가 포함되어 있는지 확인
    const keyword = searchKeyword.trim();
    const hasPlaceKeyword = keyword.includes('근처');

    // 미리 정의된 키워드 매핑 확인
    let matchedKeyword: string | undefined;
    if (hasPlaceKeyword) {
      matchedKeyword = '근처';
    } else {
      // 다른 키워드도 확인 (부분 일치)
      matchedKeyword = Object.keys(keywordPlaceMap).find(key => keyword.includes(key));
    }

    if (matchedKeyword && keywordPlaceMap[matchedKeyword]) {
      // 미리 정의된 장소 목록 사용
      // keywordPlaces.ts에 정의된 정확한 좌표를 그대로 사용
      keywordPlaceMap[matchedKeyword].forEach((location) => {
        // keywordPlaces.ts에 정의된 좌표를 직접 사용 (사용자가 수정한 정확한 좌표)
        displayMarkerFromLocation(location);
      });
    } else {
      // Places API로 검색
      places.keywordSearch(searchKeyword, (data: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          // 검색 결과를 마커로 표시
          data.forEach((place: any) => {
            displayMarkerFromPlace(place);
          });
        }
      });
    }
  }, [searchKeyword]);

  return (
    <div className="relative w-full h-screen">
      {KAKAO_MAP_API_KEY && (
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false&libraries=services`}
          strategy="afterInteractive"
          onLoad={() => setTimeout(() => window.dispatchEvent(new Event("kakaoMapLoaded")), 100)}
        />
      )}
      <div id="map" className="w-full h-full" />
    </div>
  );
}