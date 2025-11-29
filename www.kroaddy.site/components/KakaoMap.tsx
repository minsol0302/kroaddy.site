"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
    interface Window {
        kakao: any;
    }
}

export default function KakaoMapPage() {
    // 프론트엔드 환경 변수에서 직접 API 키 가져오기
    const KAKAO_MAP_API_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;

    useEffect(() => {
        if (!KAKAO_MAP_API_KEY) {
            console.warn("⚠️ 카카오맵 API 키가 설정되지 않았습니다.");
            return;
        }

        console.log("🔍 카카오맵 초기화 시작...");

        // 카카오맵 스크립트가 로드된 후 실행됨
        const initMap = () => {
            console.log("🗺️ 지도 초기화 시도...");

            if (!window.kakao || !window.kakao.maps) {
                console.error("❌ window.kakao.maps가 정의되지 않았습니다.");
                return;
            }

            // kakao.maps.load()를 사용하여 지도 API가 완전히 로드된 후 초기화
            window.kakao.maps.load(() => {
                console.log("✅ kakao.maps.load() 콜백 실행");

                const container = document.getElementById("map");
                if (!container) {
                    console.error("❌ 지도 컨테이너를 찾을 수 없습니다.");
                    return;
                }

                try {
                    const options = {
                        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울시청 좌표
                        level: 3, // 지도의 레벨(확대, 축소 정도)
                    };

                    const map = new window.kakao.maps.Map(container, options);
                    console.log("✅ 카카오 지도가 성공적으로 로드되었습니다.");
                    // map 객체는 내부적으로 복잡한 구조를 가지고 있어 console.log로 출력 시 Next.js 경고가 발생할 수 있음
                    // 여기부터 추가 시작 -------------------------------------------------
                    let currentMarker: any = null; // 현재 표시된 마커 저장용 (하나만)

                    // 지도 클릭 이벤트 등록
                    window.kakao.maps.event.addListener(map, 'click', function (mouseEvent: any) {
                        // 클릭한 위치의 좌표 가져오기
                        const latlng = mouseEvent.latLng;

                        // 기존 마커 있으면 제거
                        if (currentMarker) {
                            currentMarker.setMap(null);
                        }

                        // 새 마커 생성 및 지도에 표시
                        currentMarker = new window.kakao.maps.Marker({
                            position: latlng,
                            map: map
                        });

                        // (선택) 클릭한 위치로 지도 중심 이동
                        map.setCenter(latlng);

                        // (선택) 좌표 콘솔에 출력해서 확인 가능
                        console.log("클릭한 위치 좌표:", {
                            lat: latlng.getLat(),
                            lng: latlng.getLng()
                        });
                    });
                    // 여기까지 추가 끝
                } catch (error) {
                    console.error("❌ 지도 생성 중 오류 발생:", error);
                    if (error instanceof Error) {
                        console.error("에러 메시지:", error.message);
                        console.error("에러 스택:", error.stack);
                    }
                }
            });
        };

        // 카카오맵이 이미 로드되어 있는지 확인
        if (window.kakao && window.kakao.maps && typeof window.kakao.maps.load === 'function') {
            console.log("✅ 카카오맵이 이미 로드되어 있습니다.");
            initMap();
        } else {
            console.log("⏳ 카카오맵 스크립트 로드를 기다리는 중...");
            // 스크립트 로드 완료 이벤트 대기
            const handleKakaoMapLoad = () => {
                console.log("📦 kakaoMapLoaded 이벤트 수신");
                initMap();
            };
            window.addEventListener("kakaoMapLoaded", handleKakaoMapLoad);

            // cleanup
            return () => {
                window.removeEventListener("kakaoMapLoaded", handleKakaoMapLoad);
            };
        }
    }, [KAKAO_MAP_API_KEY]);

    return (
        <div className="w-full h-full relative">
            {!KAKAO_MAP_API_KEY && (
                <div className="absolute top-4 left-4 z-20 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    ⚠️ 카카오맵 API 키가 설정되지 않았습니다.
                </div>
            )}

            {/* 카카오 지도 스크립트 불러오기 - autoload=false로 수동 로드 */}
            {KAKAO_MAP_API_KEY && (
                <Script
                    src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false`}
                    strategy="afterInteractive"
                    onLoad={() => {
                        console.log("✅ 카카오맵 스크립트 로드 완료");
                        // 스크립트가 완전히 초기화될 때까지 약간의 지연
                        setTimeout(() => {
                            console.log("📦 kakaoMapLoaded 이벤트 발송");
                            window.dispatchEvent(new Event("kakaoMapLoaded"));
                        }, 100);
                    }}
                    onError={(e: Error | Event) => {
                        console.error("❌ 카카오맵 스크립트 로드 실패");
                        console.error("에러 타입:", e);
                        console.error("에러 상세:", e instanceof Error ? e.message : "Event 객체");
                        console.error("현재 접속 URL:", window.location.origin);
                        console.error("API 키 확인:", KAKAO_MAP_API_KEY ? `${KAKAO_MAP_API_KEY.substring(0, 10)}...` : "없음");
                        console.error("스크립트 URL:", `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}`);
                        console.error("⚠️ 중요: 카카오 개발자 콘솔에서 다음 도메인을 등록해야 합니다:");
                        console.error("   - http://localhost:3000 (필수)");
                        console.error("가능한 원인:");
                        console.error("1. 도메인 불일치: 현재 접속 URL이 등록된 도메인과 다름");
                        console.error("2. JavaScript 키가 올바른지 확인");
                        console.error("3. 네트워크 탭에서 sdk.js 요청 상태 확인 (403 에러 = 도메인 미등록)");
                    }}
                />
            )}

            {/* 지도를 그릴 영역 */}
            <div
                id="map"
                className="w-full h-full"
                style={{
                    border: "1px solid #ccc",
                }}
            ></div>
        </div>
    );
}

