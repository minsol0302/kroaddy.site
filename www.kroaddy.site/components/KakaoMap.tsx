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
  const mapRef = useRef<any>(null);

  const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

  // 장소 정보를 말풍선에 넣는 함수
  const updateInfoWindow = (name: string, address: string) => {
    const content = `
      <div style="
        background: white;
        border: 1px solid #ddd;
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        min-width: 260px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        position: relative;
        margin-bottom: 16px;
      ">
        <div style="
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 6px;
        ">
          ${name}
        </div>
        <div style="
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        ">
          ${address}
        </div>
        <button onclick="if(infoWindowRef?.current) infoWindowRef.current.close()"
          style="
            position: absolute;
            top: 8px; right: 8px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #aaa;
          ">×</button>
      </div>`;

    if (infoWindowRef.current) {
      infoWindowRef.current.setContent(content);
    }
  };

  // 좌표로 주소 검색해서 말풍선 업데이트
  const searchAddrFromCoords = (latlng: any) => {
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const addr = result[0].road_address || result[0].address;
        const placeName = addr?.road_address_name ? "위치 조정됨" : "새로운 위치";
        const addressName = addr?.road_address_name || addr?.address_name || "주소 검색 중...";

        updateInfoWindow(placeName, addressName);
      }
    });

    // 주변 장소도 다시 검색해서 이름 가져오기
    const places = new window.kakao.maps.services.Places();
    places.keywordSearch("카페 음식점 관광 명소", (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const near = data.find((p: any) =>
          Math.abs(parseFloat(p.y) - latlng.getLat()) < 0.001 &&
          Math.abs(parseFloat(p.x) - latlng.getLng()) < 0.001
        );
        if (near) {
          updateInfoWindow(near.place_name, near.road_address_name || near.address_name);
        }
      }
    }, { location: latlng, radius: 300 });
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

        const clearPrevious = () => {
          if (markerRef.current) markerRef.current.setMap(null);
          if (infoWindowRef.current) infoWindowRef.current.close();
        };

        window.kakao.maps.event.addListener(map, "click", function (mouseEvent: any) {
          clearPrevious();

          const latlng = mouseEvent.latLng;

          // 드래그 가능한 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: latlng,
            draggable: true,  // 이게 핵심!
            map: map,
          });

          // 처음 클릭했을 때 말풍선
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="
                background:white; border:1px solid #ddd; border-radius:12px;
                padding:16px 20px; box-shadow:0 8px 24px rgba(0,0,0,0.15);
                min-width:260px; font-family:system-ui; margin-bottom:16px;
              ">
                <div style="font-weight:700; font-size:18px; margin-bottom:6px;">위치 선택됨</div>
                <div style="font-size:14px; color:#666;">드래그해서 조정하세요</div>
                <button onclick="if(infoWindowRef?.current) infoWindowRef.current.close()"
                  style="position:absolute; top:8px; right:8px; background:none; border:none; font-size:20px; cursor:pointer;">×</button>
              </div>`,
            removable: true,
          });

          infowindow.open(map, marker);
          map.panTo(latlng);

          // 드래그 끝날 때마다 주소 업데이트
          window.kakao.maps.event.addListener(marker, "dragend", function () {
            const newPos = marker.getPosition();
            searchAddrFromCoords(newPos);
            map.panTo(newPos);
          });

          // 처음 위치도 주소 검색
          searchAddrFromCoords(latlng);

          markerRef.current = marker;
          infoWindowRef.current = infowindow;
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