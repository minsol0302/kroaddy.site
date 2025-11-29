"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMapPage() {
  const markerRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

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

        const geocoder = new window.kakao.maps.services.Geocoder();
        const places = new window.kakao.maps.services.Places();

        const clearPrevious = () => {
          if (markerRef.current) markerRef.current.setMap(null);
          if (infoWindowRef.current) infoWindowRef.current.close();
          markerRef.current = null;
          infoWindowRef.current = null;
        };

        window.kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
          clearPrevious();

          const latlng = mouseEvent.latLng;

          geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
            if (status !== window.kakao.maps.services.Status.OK) return;

            const addr = result[0].road_address || result[0].address;
            const addressName = addr?.road_address_name || addr?.address_name || "서울 어딘가";

            places.keywordSearch(addressName, (data: any, status2: any) => {
              let placeName = "여기 좋아요";
              let placeAddress = addressName;

              if (status2 === window.kakao.maps.services.Status.OK && data.length > 0) {
                const p = data[0];
                placeName = p.place_name;
                placeAddress = p.road_address_name || p.address_name || addressName;
              }

              const marker = new window.kakao.maps.Marker({
                position: latlng,
                map,
                image: new window.kakao.maps.MarkerImage(
                  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                  new window.kakao.maps.Size(48, 56),
                  { offset: new window.kakao.maps.Point(24, 56) }
                ),
              });

              // 진짜 세련된 흰색 말풍선 + 애니메이션
              const content = `
                <div style="
                  background: white;
                  border-radius: 24px;
                  padding: 24px 28px;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
                  min-width: 280px;
                  max-width: 340px;
                  animation: floatUp 0.5s ease-out;
                  position: relative;
                  font-family: 'Pretendard', -apple-system, sans-serif;
                  margin-bottom: 20px;
                ">
                  <div style="
                    font-size: 22px;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin-bottom: 10px;
                    line-height: 1.3;
                  ">
                    ${placeName}
                  </div>
                  <div style="
                    font-size: 15px;
                    color: #666;
                    line-height: 1.5;
                    font-weight: 500;
                  ">
                    ${placeAddress}
                  </div>

                  <!-- 꼬리 -->
                  <div style="
                    position: absolute;
                    bottom: -12px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 14px solid transparent;
                    border-right: 14px solid transparent;
                    border-top: 16px solid white;
                  "></div>
                </div>

                <style>
                  @keyframes floatUp {
                    0% { opacity: 0; transform: translateY(30px) scale(0.9); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                  }
                </style>`;

              const infowindow = new window.kakao.maps.InfoWindow({
                content,
                removable: true,
              });

              infowindow.open(map, marker);
              map.panTo(latlng);

              markerRef.current = marker;
              infoWindowRef.current = infowindow;
            });
          });
        });
      });
    };

    if (window.kakao?.maps?.load) initMap();
    else {
      const handler = () => initMap();
      window.addEventListener("kakaoMapLoaded", handler);
      return () => window.removeEventListener("kakaoMapLoaded", handler);
    }
  }, [KAKAO_MAP_API_KEY]);

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