"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createMarkerTooltipContent } from "./MarkerTooltip";
import { Location, LanguageCode } from "../lib/types";
import { keywordPlaceMap } from "../lib/keywordPlaces";
import { searchContentId, fetchTourImages } from "../lib/tourApi";
import { getCurrentLanguage, t } from "../lib/i18n";

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
  onLocationUpdate?: (location: { lat: number; lng: number }) => void; // 현재 위치 업데이트 콜백
}

// 전역으로 onPlaceClick 저장 (이벤트 핸들러에서 접근하기 위해)
let globalOnPlaceClick: ((place: Location) => void) | undefined = undefined;

// LanguageCode를 카카오 지도 언어 코드로 변환
// 카카오 지도는 ko, en, ja, zh만 지원합니다
const getKakaoMapLang = (langCode: LanguageCode): string => {
  const langMap: Record<LanguageCode, string> = {
    'ko': 'ko',
    'en': 'en',
    'ja': 'ja',
    'zh-CN': 'zh',  // 중국어 간체는 zh로 통일
    'zh-TW': 'zh',  // 중국어 번체도 zh로 통일
    'fr': 'en',     // 지원하지 않는 언어는 영어로 폴백
    'de': 'en',
    'vi': 'en',
    'id': 'en',
    'th': 'en',
    'ar': 'en',
    'mn': 'en',
    'pt': 'en',
    'es': 'en',
    'it': 'en',
    'uz': 'en',
    'km': 'en',
    'ne': 'en',
  };
  return langMap[langCode] || 'en';
};


export default function KakaoMapPage({ route = [], searchKeyword = '', onPlaceClick, resetKey = 0, drawRouteKey = 0, onLocationUpdate }: KakaoMapProps) {
  const mapRef = useRef<any>(null);
  const [mapKey, setMapKey] = useState(0); // 지도 재초기화를 위한 키
  const [scriptLoaded, setScriptLoaded] = useState(false); // Script 로드 상태
  const scriptRef = useRef<HTMLScriptElement | null>(null);
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
  // 마커의 실제 위치 저장 (location.id -> 실제 좌표)
  const markerPositionsRef = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  // 현재 언어 상태
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguage());
  // 경로확인 활성화 상태
  const [isRouteCheckActive, setIsRouteCheckActive] = useState(false);
  // 이미지 표시 상태
  const [showStreetView, setShowStreetView] = useState(false);
  // 클릭한 장소 정보 (이미지 표시용)
  const [selectedPlaceForImage, setSelectedPlaceForImage] = useState<Location | null>(null);

  // 장소별 이미지 매핑
  const placeImageMap: Record<string, string> = {
    '광장시장': '/place/kwangjang.jpg',
    '경복궁': '/place/kyungbok.png',
    '청계천': '/place/chunjpg.jpg',
    '명동대성당': '/place/myungdongsungjpg.jpg',
    '꽃밥에 피다 북촌 친환경 그로서란트': '/place/kotbab.jpg',
    '비건 인사 채식당': '/place/ddp.jpg',
    '채식요리전문점 오세계향': '/place/ddp.jpg',
    '카페 수달': '/place/ddp.jpg',
    '청수당 베이커리': '/place/sudang.jpg',
    '서울 역사 박물관': '/place/ddp.jpg',
    '대한민국 역사 박물관': '/place/ddp.jpg',
    '국립 고궁 박물관': '/place/ddp.jpg',
    '국립 민속 박물관': '/place/ddp.jpg',
    '국립 중앙 박물관': '/place/ddp.jpg',
  };

  const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  // Tour API 이미지 캐시 (같은 장소에 대해 중복 요청 방지)
  const tourImageCache = useRef<Map<string, string>>(new Map());

  // 마커 hover 시 Tour API에서 이미지 가져오기
  async function onMarkerHover(location: Location) {
    try {
      // 캐시 확인
      if (tourImageCache.current.has(location.id)) {
        return tourImageCache.current.get(location.id) || null;
      }

      // 1) 장소명 → contentId
      const contentId = await searchContentId(location.name);
      if (!contentId) {
        console.warn("Tour API 결과 없음. 기본 이미지 사용");
        return null;
      }

      // 2) contentId → 이미지
      const images = await fetchTourImages(contentId);

      const imageUrl = images.length > 0 ? images[0] : null;

      if (imageUrl) {
        tourImageCache.current.set(location.id, imageUrl);
      }

      return imageUrl;
    } catch (e) {
      console.error(e);
      return null;
    }
  }


  // onPlaceClick을 전역에 저장 (이벤트 핸들러에서 접근하기 위해)
  useEffect(() => {
    // 경로확인이 활성화된 상태에서 장소를 클릭하면 이미지 표시
    globalOnPlaceClick = (place: Location) => {
      if (isRouteCheckActive) {
        // 활성화된 상태에서 장소 클릭 시 해당 장소의 이미지 표시
        setSelectedPlaceForImage(place);
        setShowStreetView(true);
      } else {
        // 비활성화 상태에서는 기존 동작 (PlacePopup 열기)
        if (onPlaceClick) {
          onPlaceClick(place);
        }
      }
    };
  }, [onPlaceClick, isRouteCheckActive]);

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

    // 마커 위치 정보 초기화
    markerPositionsRef.current.clear();
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

    // 정렬된 route의 각 장소를 순서대로 추가 (마커의 실제 위치 사용)
    sortedRoute.forEach((location) => {
      // 마커의 실제 위치가 있으면 사용, 없으면 route의 좌표 사용
      const actualPosition = markerPositionsRef.current.get(location.id);
      if (actualPosition) {
        path.push(new window.kakao.maps.LatLng(actualPosition.lat, actualPosition.lng));
      } else {
        // 마커가 아직 생성되지 않았거나 위치 정보가 없는 경우 route 좌표 사용
        path.push(new window.kakao.maps.LatLng(location.lat, location.lng));
      }
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
      // 마커의 실제 위치가 있으면 사용, 없으면 route 좌표 사용
      const actualPosition = markerPositionsRef.current.get(location.id);
      if (actualPosition) {
        bounds.extend(new window.kakao.maps.LatLng(actualPosition.lat, actualPosition.lng));
      } else {
        bounds.extend(new window.kakao.maps.LatLng(location.lat, location.lng));
      }
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

        // 위치 정보를 부모 컴포넌트로 전달
        if (onLocationUpdate) {
          onLocationUpdate({ lat, lng });
        }

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
            const totalWidth = displayWidth + shadowOffset + padding * 2;
            const totalHeight = displayHeight + shadowOffset + padding * 2;
            const markerImageSize = new window.kakao.maps.Size(
              totalWidth,
              totalHeight
            );

            const actualMarkerBottom = padding + displayHeight;

            const markerImageOption = {
              offset: new window.kakao.maps.Point(
                totalWidth / 2, // 가로 중앙
                actualMarkerBottom // 실제 마커 이미지의 하단 (뾰족한 부분)
              )
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

            // 마커의 실제 위치 저장 (경로 그리기 시 사용)
            markerPositionsRef.current.set(finalLocation.id, {
              lat: markerPosition.lat,
              lng: markerPosition.lng
            });

            // 마커 생성 후 경로가 그려져야 하는 경우 경로 업데이트
            if (routePolylineRef.current && mapRef.current) {
              drawRoute(mapRef.current);
            }

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
            let isHovering = false; // 현재 hover 상태 추적
            window.kakao.maps.event.addListener(marker, "mouseover", async function () {
              isHovering = true;

              // 다른 tooltip 모두 숨김
              markerTooltipsRef.current.forEach((tooltip) => {
                if (tooltip && tooltip !== tooltipOverlay) {
                  tooltip.setMap(null);
                }
              });

              // 현재 tooltip 즉시 표시
              if (tooltipOverlay) {
                tooltipOverlay.setMap(map);
              }

              // Tour API에서 이미지 가져오기 (비동기, 백그라운드에서 처리)
              const tourImageUrl = await onMarkerHover(finalLocation);

              // hover 상태가 유지되고 있고, 이미지를 가져왔으면 tooltip의 이미지 업데이트
              if (isHovering && tourImageUrl && tooltipOverlay) {
                try {
                  // tooltip이 여전히 표시되어 있는지 확인
                  if (tooltipOverlay.getMap() === map) {
                    const tooltipContentStr = tooltipOverlay.getContent(); // 문자열 반환
                    if (tooltipContentStr) {
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(tooltipContentStr, 'text/html');
                      const imgElement = doc.querySelector('.marker-tooltip-image img') as HTMLImageElement;
                      if (imgElement) {
                        imgElement.src = tourImageUrl;
                        tooltipOverlay.setContent(doc.body.innerHTML); // 변경 내용 반영
                      }
                    }
                  }
                } catch (e) {
                  console.error('Tooltip 이미지 업데이트 실패:', e);
                }
              }
            });

            // 마커에 mouseout 이벤트 추가
            window.kakao.maps.event.addListener(marker, "mouseout", function () {
              isHovering = false; // hover 상태 해제
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

  // 초기 Script 로드
  useEffect(() => {
    if (!KAKAO_MAP_API_KEY) return;

    const kakaoLang = getKakaoMapLang(currentLanguage);
    loadKakaoMapScript(kakaoLang);

    return () => {
      // 컴포넌트 언마운트 시 Script 제거
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []); // 초기 마운트 시에만 실행

  // Script 로드 후 지도 초기화
  useEffect(() => {
    if (!KAKAO_MAP_API_KEY || !scriptLoaded) return;

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

    if (window.kakao?.maps?.load) {
      initMap();
    } else {
      const handler = () => initMap();
      window.addEventListener("kakaoMapLoaded", handler);
      return () => window.removeEventListener("kakaoMapLoaded", handler);
    }
  }, [scriptLoaded, route, KAKAO_MAP_API_KEY]);

  // Script 동적 로드 함수
  const loadKakaoMapScript = useCallback((lang: string) => {
    console.log('카카오 지도 Script 로드 시작, 언어:', lang);

    // 기존 Script 모두 제거 (모든 카카오 지도 관련 Script 찾기)
    const existingScripts = document.querySelectorAll('script[src*="dapi.kakao.com"]');
    existingScripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    scriptRef.current = null;

    // window.kakao 객체 완전히 제거
    if (window.kakao) {
      try {
        delete (window as any).kakao;
      } catch (e) {
        (window as any).kakao = undefined;
      }
    }

    // scriptLoaded 상태 초기화
    setScriptLoaded(false);

    // 지도 컨테이너 비우기
    const container = document.getElementById("map");
    if (container) {
      container.innerHTML = '';
    }

    // 새 Script 생성
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false&libraries=services&lang=${lang}`;
    script.async = true;
    script.onload = () => {
      console.log('카카오 지도 Script 로드 완료, 언어:', lang);
      setScriptLoaded(true);
      setTimeout(() => {
        window.dispatchEvent(new Event("kakaoMapLoaded"));
      }, 200);
    };
    script.onerror = () => {
      console.error('카카오 지도 SDK 로드 실패');
      setScriptLoaded(false);
    };
    document.head.appendChild(script);
    scriptRef.current = script;
  }, [KAKAO_MAP_API_KEY]);

  // 언어 변경 감지 및 지도 언어 업데이트
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = getCurrentLanguage();
      const kakaoLang = getKakaoMapLang(newLang);

      console.log('언어 변경 감지:', newLang, '-> 카카오 지도 언어:', kakaoLang);
      console.log('handleLanguageChange 함수 실행 중...');

      setCurrentLanguage(newLang);
      console.log('setCurrentLanguage 호출 완료');

      // 지도 상태 저장 (지도가 초기화된 경우)
      console.log('지도 상태 저장 시작...');
      let savedCenter: any = null;
      let savedLevel = 5;

      if (mapRef.current && window.kakao?.maps) {
        try {
          savedCenter = mapRef.current.getCenter();
          savedLevel = mapRef.current.getLevel();
        } catch (e) {
          console.warn('지도 상태 저장 실패, 기본값 사용:', e);
        }
      }

      // 기본값 설정 (지도가 초기화되지 않은 경우)
      if (!savedCenter && window.kakao?.maps) {
        savedCenter = new window.kakao.maps.LatLng(37.5665, 126.9780);
      } else if (!savedCenter) {
        // window.kakao가 없는 경우, 나중에 설정
        savedCenter = { lat: 37.5665, lng: 126.9780 };
      }

      console.log('언어 변경 처리 시작, KAKAO_MAP_API_KEY:', KAKAO_MAP_API_KEY ? '존재' : '없음');

      try {
        // 기존 지도 제거
        if (mapRef.current) {
          console.log('기존 지도 제거 중...');
          // 모든 마커 제거
          markersRef.current.forEach(marker => {
            try {
              marker.setMap(null);
            } catch (e) {
              // 무시
            }
          });
          markersRef.current = [];
          searchMarkersRef.current.forEach(marker => {
            try {
              marker.setMap(null);
            } catch (e) {
              // 무시
            }
          });
          searchMarkersRef.current = [];
          // 현재 위치 마커 제거
          if (currentLocationMarkerRef.current) {
            try {
              currentLocationMarkerRef.current.setMap(null);
            } catch (e) {
              // 무시
            }
            currentLocationMarkerRef.current = null;
          }
          if (currentLocationCircleRef.current) {
            try {
              currentLocationCircleRef.current.setMap(null);
            } catch (e) {
              // 무시
            }
            currentLocationCircleRef.current = null;
          }
          // 경로 제거
          if (routePolylineRef.current) {
            try {
              routePolylineRef.current.setMap(null);
            } catch (e) {
              // 무시
            }
            routePolylineRef.current = null;
          }
        }

        mapRef.current = null;

        // 지도 컨테이너 완전히 비우기
        const container = document.getElementById("map");
        if (container) {
          container.innerHTML = '';
          console.log('지도 컨테이너 비움 완료');
        }

        // Script를 새 언어로 다시 로드
        console.log('loadKakaoMapScript 호출 전, 언어:', kakaoLang);
        if (!KAKAO_MAP_API_KEY) {
          console.error('KAKAO_MAP_API_KEY가 없습니다!');
          return;
        }
        loadKakaoMapScript(kakaoLang);
        console.log('loadKakaoMapScript 호출 완료');

        // Script 로드 완료 후 지도 재초기화를 위해 상태 저장
        const finalCenter = savedCenter;
        const finalLevel = savedLevel;

        // Script 로드 완료 이벤트 리스너
        const reinitHandler = () => {
          setTimeout(() => {
            if (window.kakao?.maps) {
              const mapContainer = document.getElementById("map");
              if (mapContainer) {
                window.kakao.maps.load(() => {
                  // center 좌표 처리
                  let centerLatLng;
                  if (finalCenter && typeof finalCenter.getLat === 'function') {
                    // 이미 LatLng 객체인 경우
                    centerLatLng = finalCenter;
                  } else if (finalCenter && finalCenter.lat && finalCenter.lng) {
                    // 일반 객체인 경우
                    centerLatLng = new window.kakao.maps.LatLng(finalCenter.lat, finalCenter.lng);
                  } else {
                    // 기본값
                    centerLatLng = new window.kakao.maps.LatLng(37.5665, 126.9780);
                  }

                  const newMap = new window.kakao.maps.Map(mapContainer, {
                    center: centerLatLng,
                    level: finalLevel,
                  });
                  mapRef.current = newMap;

                  console.log('지도 재초기화 완료, 언어:', kakaoLang);

                  // 지도가 완전히 로드된 후 언어 적용을 위해 약간의 지연 후 지도 갱신
                  setTimeout(() => {
                    // 지도를 약간 이동시켜서 다시 렌더링 (언어 적용을 위해)
                    const currentCenter = newMap.getCenter();
                    newMap.setCenter(new window.kakao.maps.LatLng(
                      currentCenter.getLat() + 0.00001,
                      currentCenter.getLng()
                    ));
                    setTimeout(() => {
                      newMap.setCenter(currentCenter);
                    }, 100);
                  }, 500);

                  // 현재 위치 다시 설정
                  setCurrentLocation(newMap);

                  // route가 있으면 오버레이 다시 생성
                  if (route && route.length > 0) {
                    createOverlays(newMap);
                  }
                });
              }
            }
            window.removeEventListener("kakaoMapLoaded", reinitHandler);
          }, 100);
        };

        window.addEventListener("kakaoMapLoaded", reinitHandler);
      } catch (error) {
        console.error('카카오 지도 언어 변경 실패:', error);
        console.error('에러 상세:', error);
      }
    };

    console.log('언어 변경 이벤트 리스너 등록');
    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      console.log('언어 변경 이벤트 리스너 제거');
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [route, KAKAO_MAP_API_KEY, loadKakaoMapScript]);

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
      let isHovering = false; // 현재 hover 상태 추적
      window.kakao.maps.event.addListener(marker, "mouseover", async function () {
        isHovering = true;

        // 다른 tooltip 모두 숨김
        markerTooltipsRef.current.forEach((tooltip) => {
          if (tooltip && tooltip !== tooltipOverlay) {
            tooltip.setMap(null);
          }
        });

        // 현재 tooltip 즉시 표시
        if (tooltipOverlay) {
          tooltipOverlay.setMap(map);
        }

        // Tour API에서 이미지 가져오기 (비동기, 백그라운드에서 처리)
        const tourImageUrl = await onMarkerHover(location);

        // hover 상태가 유지되고 있고, 이미지를 가져왔으면 tooltip의 이미지 업데이트
        if (isHovering && tourImageUrl && tooltipOverlay) {
          try {
            // tooltip이 여전히 표시되어 있는지 확인
            if (tooltipOverlay.getMap() === map) {
              const tooltipContentStr = tooltipOverlay.getContent(); // 문자열 반환
              if (tooltipContentStr) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(tooltipContentStr, 'text/html');
                const imgElement = doc.querySelector('.marker-tooltip-image img') as HTMLImageElement;
                if (imgElement) {
                  imgElement.src = tourImageUrl;
                  tooltipOverlay.setContent(doc.body.innerHTML); // 변경 내용 반영
                }
              }
            }
          } catch (e) {
            console.error('Tooltip 이미지 업데이트 실패:', e);
          }
        }
      });

      // 마커에 mouseout 이벤트 추가
      window.kakao.maps.event.addListener(marker, "mouseout", function () {
        isHovering = false; // hover 상태 해제
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

    // 키워드에 '있을까?'가 포함되어 있는지 확인
    const keyword = searchKeyword.trim();
    const hasPlaceKeyword = keyword.includes('있을까?');

    // 미리 정의된 키워드 매핑 확인
    let matchedKeyword: string | undefined;
    if (hasPlaceKeyword) {
      matchedKeyword = '있을까?';
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

  // 경로 확인 버튼 토글 핸들러
  const handleToggleRouteCheck = () => {
    // 활성화/비활성화 토글
    setIsRouteCheckActive(prev => !prev);
  };

  // 이미지 닫기 핸들러
  const handleCloseStreetView = () => {
    setShowStreetView(false);
    setSelectedPlaceForImage(null);
  };

  // 선택된 장소에 맞는 이미지 URL 가져오기
  const getPlaceImageUrl = (place: Location | null): string => {
    if (!place) return '/place/ddp.jpg'; // 기본 이미지

    // 1순위: 정확한 장소명으로 매핑 확인
    let imageUrl = placeImageMap[place.name];

    // 2순위: 장소 ID로 매핑 확인
    if (!imageUrl) {
      const idImageMap: Record<string, string> = {
        'place1': '/place/kyungbok.png', // 경복궁
        'place4': '/place/kotbab.jpg', // 꽃밥에 피다
        'place10': '/place/kwangjang.jpg', // 광장시장
        'place2': '/place/chunjpg.jpg', // 청계천
        'place3': '/place/myungdongsungjpg.jpg', // 명동대성당
        'place9': '/place/sudang.jpg', // 청수당 베이커리
      };
      imageUrl = idImageMap[place.id];
    }

    // 3순위: 장소명에 키워드가 포함되어 있는지 확인
    if (!imageUrl) {
      const name = place.name;
      if (name.includes('경복궁')) {
        imageUrl = '/place/kyungbok.png';
      } else if (name.includes('꽃밥') || name.includes('꽃밥에 피다')) {
        imageUrl = '/place/kotbab.jpg';
      } else if (name.includes('광장시장')) {
        imageUrl = '/place/kwangjang.jpg';
      } else if (name.includes('청계천')) {
        imageUrl = '/place/chunjpg.jpg';
      } else if (name.includes('명동대성당') || name.includes('명동 대성당')) {
        imageUrl = '/place/myungdongsungjpg.jpg';
      } else if (name.includes('청수당')) {
        imageUrl = '/place/sudang.jpg';
      }
    }

    return imageUrl || '/place/ddp.jpg'; // 매핑이 없으면 기본 이미지
  };

  return (
    <div className="relative w-full h-screen">
      {/* 지도 컨테이너 - 이미지가 표시되면 숨김 */}
      <div id="map" className={`w-full h-full ${showStreetView ? 'hidden' : ''}`} />

      {/* 장소별 이미지 - 이미지가 표시되면 보임 */}
      {showStreetView && selectedPlaceForImage && (
        <div className="absolute inset-0 w-full h-full bg-black z-50 relative">
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseStreetView}
            className="absolute top-4 right-4 z-60 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors font-medium text-sm flex items-center gap-2"
          >
            <span>✕</span>
            <span>{t('map.closeStreetView', currentLanguage)}</span>
          </button>

          {/* 장소명 표시 */}
          <div className="absolute top-4 left-4 z-60 px-4 py-2 bg-black/70 text-white rounded-lg shadow-lg font-medium text-sm">
            {selectedPlaceForImage.name}
          </div>

          {/* 장소별 이미지 */}
          <img
            src={getPlaceImageUrl(selectedPlaceForImage)}
            alt={selectedPlaceForImage.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 이미지 로드 실패 시 경고 메시지
              console.warn('이미지 로드 실패:', selectedPlaceForImage.name);
              alert(t('map.imageLoadError', currentLanguage));
              setShowStreetView(false);
            }}
          />

          {/* 현재 위치 마커 오버레이 */}
          {currentLocationRef.current && (
            <div
              className="absolute z-50"
              style={{
                // 현재 위치를 이미지 중앙에 배치 (예시 위치, 실제로는 좌표에 맞게 조정 필요)
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* 현재 위치 마커 */}
              <div
                className="w-6 h-6 bg-blue-500 border-3 border-white rounded-full shadow-lg"
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: '#4285F4',
                  border: '3px solid white',
                  borderRadius: '50%',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              />
              {/* 현재 위치 원형 오버레이 */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500 rounded-full opacity-30"
                style={{
                  width: '100px',
                  height: '100px',
                  border: '2px solid #4285F4',
                  borderRadius: '50%',
                  opacity: 0.3,
                  marginTop: '-50px',
                  marginLeft: '-50px',
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 경로확인 활성화 버튼 - 지도 왼쪽 하단, 스케일 바 위에 배치 */}
      {route && route.length > 0 && !showStreetView && (
        <button
          onClick={handleToggleRouteCheck}
          className={`absolute bottom-16 left-4 z-10 px-4 py-2 rounded-lg shadow-lg transition-colors font-medium text-sm ${isRouteCheckActive
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          style={{
            // 카카오 지도 스케일 바 위에 배치 (스케일 바는 약 bottom: 10px, left: 10px 위치)
            bottom: '60px', // 스케일 바 위에 여유 공간을 두고 배치
            left: '16px',
          }}
        >
          {isRouteCheckActive ? t('map.routeCheckActive', currentLanguage) : t('map.checkRoute', currentLanguage)}
        </button>
      )}
    </div>
  );
}