"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { createOverlayContent } from "./CustomOverlay";
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
}

// 전역으로 onPlaceClick 저장 (이벤트 핸들러에서 접근하기 위해)
let globalOnPlaceClick: ((place: Location) => void) | undefined = undefined;

export default function KakaoMapPage({ route = [], searchKeyword = '', onPlaceClick, resetKey = 0 }: KakaoMapProps) {
  const mapRef = useRef<any>(null);
  const customOverlaysRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const overlayLocationMapRef = useRef<Map<any, Location>>(new Map());
  // 지도 클릭으로 생성된 마커와 오버레이 (route와 별도 관리)
  const clickMarkerRef = useRef<any>(null);
  const clickOverlayRef = useRef<any>(null);
  // 키워드 검색으로 생성된 마커 (route와 별도 관리)
  const searchMarkersRef = useRef<any[]>([]);

  const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  // 지도 클릭으로 생성된 Location 저장
  const clickLocationRef = useRef<Location | null>(null);

  // onPlaceClick을 전역에 저장 (이벤트 핸들러에서 접근하기 위해)
  useEffect(() => {
    globalOnPlaceClick = onPlaceClick;
  }, [onPlaceClick]);

  // 모든 오버레이 닫기
  const closeAllOverlays = () => {
    customOverlaysRef.current.forEach((overlay) => {
      if (overlay) overlay.setMap(null);
    });
  };

  // 기존 오버레이와 마커 제거 (route 기반만)
  const clearOverlays = () => {
    customOverlaysRef.current.forEach((overlay) => {
      if (overlay) overlay.setMap(null);
    });
    customOverlaysRef.current = [];

    markersRef.current.forEach((marker) => {
      if (marker) marker.setMap(null);
    });
    markersRef.current = [];
    overlayLocationMapRef.current.clear();
  };

  // 지도 클릭으로 생성된 마커와 오버레이 제거
  const clearClickMarker = () => {
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }
    if (clickOverlayRef.current) {
      clickOverlayRef.current.setMap(null);
      clickOverlayRef.current = null;
    }
    clickLocationRef.current = null;
  };

  // 키워드 검색으로 생성된 마커 제거
  const clearSearchMarkers = () => {
    searchMarkersRef.current.forEach((marker) => {
      if (marker) marker.setMap(null);
    });
    searchMarkersRef.current = [];
  };

  // route에 따라 마커와 오버레이 생성 (오버레이는 숨김 상태)
  const createOverlays = (map: any) => {
    if (!route || route.length === 0) return;

    route.forEach((location) => {
      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(location.lat, location.lng),
        map: map,
      });
      markersRef.current.push(marker);

      // 커스텀 오버레이 생성 (카카오맵 API 방식 - CSS로 위치 조정)
      const overlayId = `overlay-${location.id || location.name}`;
      const content = createOverlayContent(location, overlayId);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(location.lat, location.lng),
        content: content,
        // xAnchor, yAnchor 제거 - CSS로 위치 조정
      });

      // 초기에는 오버레이를 숨김 상태로 설정
      customOverlay.setMap(null);
      customOverlaysRef.current.push(customOverlay);
      overlayLocationMapRef.current.set(customOverlay, location);

      // 닫기 버튼 이벤트 리스너 등록
      setTimeout(() => {
        const closeBtn = document.getElementById(`close-${overlayId}`);
        if (closeBtn) {
          closeBtn.onclick = () => {
            customOverlay.setMap(null);
          };
        };
      }, 100);

      // 확장 버튼 이벤트 리스너 등록
      setTimeout(() => {
        const expandBtn = document.getElementById(`expand-${overlayId}`);
        if (expandBtn) {
          expandBtn.onclick = () => {
            if (globalOnPlaceClick) {
              customOverlay.setMap(null);
              globalOnPlaceClick(location);
            }
          };
        };
      }, 100);

      // 마커 클릭 이벤트 - 오버레이 토글 (카카오맵 API 방식)
      window.kakao.maps.event.addListener(marker, "click", () => {
        // 현재 오버레이가 열려있는지 확인
        const isOpen = customOverlay.getMap() !== null;

        if (isOpen) {
          // 열려있으면 닫기
          customOverlay.setMap(null);
        } else {
          // 닫혀있으면 다른 오버레이 모두 닫고 이 오버레이만 열기
          closeAllOverlays();
          customOverlay.setMap(map);
        }
      });
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (route.length > 0) {
      const bounds = new window.kakao.maps.LatLngBounds();
      route.forEach((location) => {
        bounds.extend(new window.kakao.maps.LatLng(location.lat, location.lng));
      });
      map.setBounds(bounds);
    }
  };

  useEffect(() => {
    if (!KAKAO_MAP_API_KEY) return;

    const initMap = () => {
      if (!window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        if (!container) return;

        const map = new window.kakao.maps.Map(container, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
        mapRef.current = map;

        // 지도 클릭 이벤트 - 주변에 실제 장소가 있을 때만 마커 표시
        window.kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
          // route 기반 오버레이 닫기 (동시에 하나만 표시)
          closeAllOverlays();
          // route 기반 마커는 유지하고, 클릭으로 생성된 마커만 제거
          clearClickMarker();

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

            // 장소를 찾았으면 주소 검색 후 오버레이만 생성 (마커는 생성하지 않음)
            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].road_address || result[0].address;
                const addressName = addr?.road_address_name || addr?.address_name || "주소 검색 중...";

                // 오버레이만 생성 (마커는 생성하지 않음)
                const timestamp = Date.now();
                const tempLocation: Location = {
                  id: `click-${timestamp}`,
                  name: placeName || "장소",
                  address: addressName,
                  lat: latlng.getLat(),
                  lng: latlng.getLng(),
                };

                clickLocationRef.current = tempLocation;

                const overlayId = `overlay-click-${timestamp}`;
                const content = createOverlayContent(tempLocation, overlayId);

                const customOverlay = new window.kakao.maps.CustomOverlay({
                  position: latlng,
                  content: content,
                  // xAnchor, yAnchor 제거 - CSS로 위치 조정
                });

                customOverlay.setMap(map);
                clickOverlayRef.current = customOverlay;

                // 닫기 버튼 이벤트 리스너 등록
                setTimeout(() => {
                  const closeBtn = document.getElementById(`close-${overlayId}`);
                  if (closeBtn) {
                    closeBtn.onclick = () => {
                      customOverlay.setMap(null);
                      clickLocationRef.current = null;
                    };
                  };
                }, 100);

                // 확장 버튼 이벤트 리스너 등록
                setTimeout(() => {
                  const expandBtn = document.getElementById(`expand-${overlayId}`);
                  if (expandBtn) {
                    expandBtn.onclick = () => {
                      if (globalOnPlaceClick) {
                        customOverlay.setMap(null);
                        const locationToShow = clickLocationRef.current;
                        clickLocationRef.current = null;
                        if (locationToShow) {
                          globalOnPlaceClick(locationToShow);
                        }
                      }
                    };
                  };
                }, 100);

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

  // route 변경 시 오버레이 업데이트
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    clearOverlays();

    if (route && route.length > 0) {
      createOverlays(mapRef.current);
    }
  }, [route]);

  // resetKey 변경 시 모든 마커와 오버레이 초기화
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    clearOverlays();
    clearClickMarker();
    clearSearchMarkers();
  }, [resetKey]);

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