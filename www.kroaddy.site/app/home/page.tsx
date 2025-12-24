"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Chatbot } from "../../components/Chatbot";
import KakaoMap from "../../components/KakaoMap";
import { PlacePopup } from "../../components/PlacePopup";
import { WeatherWidget } from "../../components/WeatherWidget";
import { Message, Location, LanguageCode } from "../../lib/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../components/ui/resizable";
import { keywordPlaceMap } from "../../lib/keywordPlaces";
import { t, getCurrentLanguage } from "../../lib/i18n";


export type Screen = 'initial' | 'chatResponse' | 'placeDetail';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('initial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null);
  const [route, setRoute] = useState<Location[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showChatbot, setShowChatbot] = useState(true);
  const [mapResetKey, setMapResetKey] = useState<number>(0);
  const [drawRouteKey, setDrawRouteKey] = useState<number>(0);
  const [uiLanguage, setUiLanguage] = useState<LanguageCode>(getCurrentLanguage());
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<{ temp: number; description: string; city: string } | null>(null);

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      setUiLanguage(getCurrentLanguage());
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  // 위치 및 날씨 정보 업데이트 핸들러
  const handleLocationUpdate = useCallback((location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
    console.log('위치 정보 업데이트:', location);
  }, []);

  const handleWeatherUpdate = useCallback((weather: { temp: number; description: string; city: string }) => {
    setWeatherInfo(weather);
    console.log('날씨 정보 업데이트:', weather);
  }, []);

  // cleanup: 컴포넌트 언마운트 시 타임아웃 및 AbortController 정리
  useEffect(() => {
    return () => {
      // 모든 타임아웃 정리
      timeoutRefsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefsRef.current = [];

      // 진행 중인 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // 공통 함수: 작성중 메시지 생성
  const createTypingMessage = useCallback((): Message => ({
    role: 'assistant',
    content: t('chatbot.typing', uiLanguage)
  }), [uiLanguage]);

  // 공통 함수: 작성중 메시지를 실제 답변으로 교체
  const replaceTypingMessage = useCallback((
    prevMessages: Message[],
    typingMessage: Message,
    newContent: string
  ): Message[] => {
    const lastMessage = prevMessages[prevMessages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === typingMessage.content) {
      return [...prevMessages.slice(0, -1), {
        role: 'assistant',
        content: newContent
      }];
    }
    return [...prevMessages, {
      role: 'assistant',
      content: newContent
    }];
  }, []);

  const handleSendMessage = (message: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);

    // '있을까?' 키워드 처리
    if (message.includes('있을까?') || message.toLowerCase().includes('nearby')) {
      // 작성중 메시지 추가
      const typingMessage = createTypingMessage();
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      const timeoutId = setTimeout(async () => {
        // 언어별로 다른 응답 제공
        let responseContent = '';

        // 한국어 장소 설명 (원본)
        const koreanPlaces = `---

## 🏛️ 경복궁 (Gyeongbokgung Palace)

서울에서 한국 전통 문화를 가장 제대로 볼 수 있는 궁궐이야. 큰 궁문이랑 왕이 쓰던 건물들이 정말 멋지고, 경회루라는 연못도 예뻐서 사진 찍기 좋아. 한국 역사나 전통 건축에 관심 있으면 꼭 가봐야 해!

---

## 🌊 청계천 (Cheonggyecheon Stream)

도시 한가운데에 있는 산책로인데, 물 흐르는 소리 들으면서 걸을 수 있어서 정말 편안해. 곳곳에 예쁜 다리랑 조형물도 있어. 특히 밤에는 조명이 예뻐서 분위기가 좋아.

---

## 🏪 광장시장 (Gwangjang Market)

서울에서 가장 오래된 전통시장 중 하나로, 요즘 외국인들이 한국 로컬 분위기 제대로 느끼고 싶을 때 꼭 찾는 곳이야. 한복, 원단, 빈티지 상점도 많아서 음식만 즐기는 곳이 아니라 "한국 일상 속 시장 문화"를 통째로 경험할 수 있는 공간이야.

---

## ⛪ 명동대성당 (Myeongdong Cathedral)

한국에서 가장 유명한 가톨릭 성당 중 하나야. 건물이 고딕 스타일이라 굉장히 아름답고, 주변이 명동이라 쇼핑하다가 잠깐 들르기 딱 좋아. 역사적으로도 의미 있는 장소야.

---

## 🥗 비건 인사 채식당 (Vegan Insa Restaurant)

인사동 근처에 있는 비건 레스토랑이야. 한국 전통 스타일을 살린 비건 요리를 맛볼 수 있어서, 비건이 아니라도 경험해보기 좋아. 외국인 여행자들도 많이 가!

---

## 🍽️ 오세계향 (Osegyehyang)

인사동에서 가장 유명한 비건 레스토랑 중 하나. 사찰음식 스타일의 요리를 현대적으로 만들어서 맛도 좋고 건강한 느낌이야. 비건 친구가 있다면 특히 추천하고 싶어.

---

## ☕ 카페 수달 (Cafe Soodal)

조용하고 편안한 분위기에 한국식 디저트도 있는 카페야. 한옥 감성도 느껴져서 서울의 전통적인 분위기를 좀 더 편하게 즐길 수 있어.

---

## 🍵 청수당 (Cheongsudang)

한옥 스타일의 카페로 요즘 정말 인기 많아. 동양적인 인테리어가 예쁘고, 디저트도 정교하게 잘 만들어져 있어. 한국 전통 분위기 + 현대 감성 모두 즐길 수 있어서 외국인들이 좋아하는 곳이야.

---`;

        if (uiLanguage === 'ko') {
          responseContent = `${t('chatbot.nearby.response', uiLanguage)}${koreanPlaces}

**${t('chatbot.nearby.selectRoute', uiLanguage)}**`;
        } else if (uiLanguage === 'en') {
          // 영어일 때는 영어 원본 사용
          const englishPlaces = `---

## 🏛️ Gyeongbokgung Palace

The best palace in Seoul to experience Korean traditional culture. The grand palace gates and buildings used by kings are truly magnificent, and the Gyeonghoeru pond is beautiful for photos. A must-visit if you're interested in Korean history or traditional architecture!

---

## 🌊 Cheonggyecheon Stream

A walking path in the middle of the city where you can walk while listening to the sound of flowing water. There are beautiful bridges and sculptures throughout. Especially beautiful at night with lighting.

---

## 🏪 Gwangjang Market

One of Seoul's oldest traditional markets, a place foreigners visit to truly experience Korean local atmosphere. Not just for food, but a space where you can experience "Korean daily market culture" with hanbok, fabric, and vintage shops.

---

## ⛪ Myeongdong Cathedral

One of Korea's most famous Catholic cathedrals. The Gothic-style building is very beautiful, and it's perfect for a quick visit while shopping in Myeongdong. A historically significant place.

---

## 🥗 Vegan Insa Restaurant

A vegan restaurant near Insadong. You can try vegan dishes in Korean traditional style, great even if you're not vegan. Popular with foreign travelers!

---

## 🍽️ Osegyehyang

One of the most famous vegan restaurants in Insadong. Modern temple food-style dishes that are tasty and healthy. Highly recommended if you have vegan friends.

---

## ☕ Cafe Soodal

A quiet and comfortable cafe with Korean-style desserts. You can feel the hanok sensibility and enjoy Seoul's traditional atmosphere more comfortably.

---

## 🍵 Cheongsudang

A hanok-style cafe that's very popular these days. Beautiful Eastern interior and well-crafted desserts. A place foreigners love for both Korean traditional atmosphere and modern sensibility.

---`;
          responseContent = `${t('chatbot.nearby.response', uiLanguage)}${englishPlaces}

**${t('chatbot.nearby.selectRoute', uiLanguage)}**`;
        } else {
          // 다른 언어의 경우 한국어를 번역
          try {
            const { translateText } = await import('../../service/translateService');
            const translatedPlaces = await translateText(koreanPlaces, 'ko', uiLanguage);
            responseContent = `${t('chatbot.nearby.response', uiLanguage)}${translatedPlaces}

**${t('chatbot.nearby.selectRoute', uiLanguage)}**`;
          } catch (error) {
            console.error('번역 실패:', error);
            // 번역 실패 시 한국어 원본 사용
            responseContent = `${t('chatbot.nearby.response', uiLanguage)}${koreanPlaces}

**${t('chatbot.nearby.selectRoute', uiLanguage)}**`;
          }
        }

        // 작성중 메시지를 실제 답변으로 교체
        setMessages(prev => replaceTypingMessage(prev, typingMessage, responseContent));

        // '있을까?' 키워드에 매핑된 장소들을 route로 설정
        if (keywordPlaceMap['있을까?']) {
          setRoute(keywordPlaceMap['있을까?']);
          setSearchKeyword(''); // 기존 검색 로직과 충돌 방지
        }
        setScreen('chatResponse');
      }, 5000);
      timeoutRefsRef.current.push(timeoutId);
      return;
    }

    // '박물관' 키워드 처리
    if (message.includes('박물관') || message.toLowerCase().includes('museum')) {
      // 작성중 메시지 추가
      const typingMessage = createTypingMessage();
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      const timeoutId = setTimeout(() => {
        const responseContent = t('chatbot.museum.response', uiLanguage);
        // 작성중 메시지를 실제 답변으로 교체
        setMessages(prev => replaceTypingMessage(prev, typingMessage, responseContent));

        // '박물관' 키워드에 매핑된 장소들을 route로 설정
        if (keywordPlaceMap['박물관']) {
          setRoute(keywordPlaceMap['박물관']);
          setSearchKeyword(''); // 기존 검색 로직과 충돌 방지
        }
        setScreen('chatResponse');
      }, 5000);
      timeoutRefsRef.current.push(timeoutId);
      return;
    }

    // '밥집집' 키워드 처리
    if (message.includes('밥집') || message.toLowerCase().includes('recommend')) {
      // 작성중 메시지 추가
      const typingMessage = createTypingMessage();
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      const timeoutId = setTimeout(() => {
        const responseContent = t('chatbot.recommend.response', uiLanguage);
        // 작성중 메시지를 실제 답변으로 교체
        setMessages(prev => replaceTypingMessage(prev, typingMessage, responseContent));

        // 기존 route에서 특정 장소 제거하고 새 장소 추가
        if (keywordPlaceMap['있을까?']) {
          const basePlaces = keywordPlaceMap['있을까?'];

          // 제거할 장소 ID 목록
          const removeIds = ['place5', 'place6', 'place7']; // 비건 인사 채식당, 오세계향, 카페 수달

          // 필터링: 제거할 장소 제외
          const filteredPlaces = basePlaces.filter(place => !removeIds.includes(place.id));

          // 꽃밥에 피다 북촌 친환경 그로서란트 추가
          const kkotbapPlace = basePlaces.find(place => place.id === 'place4');
          if (kkotbapPlace) {
            filteredPlaces.push(kkotbapPlace);
          }

          setRoute(filteredPlaces);
          setSearchKeyword(''); // 기존 검색 로직과 충돌 방지
        }
        setScreen('chatResponse');
      }, 5000);
      timeoutRefsRef.current.push(timeoutId);
      return;
    }

    // '응' 키워드 처리
    if (message.includes('응') || message.toLowerCase().includes('yes') || message.toLowerCase().includes('ok')) {
      // 작성중 메시지 추가
      const typingMessage = createTypingMessage();
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      const timeoutId = setTimeout(() => {
        const responseContent = t('chatbot.yes.response', uiLanguage);
        // 작성중 메시지를 실제 답변으로 교체
        setMessages(prev => replaceTypingMessage(prev, typingMessage, responseContent));

        // 경로를 그리기 위해 drawRouteKey 증가
        if (route.length > 0) {
          setDrawRouteKey(prev => prev + 1);
        }

        setScreen('chatResponse');
      }, 5000);
      timeoutRefsRef.current.push(timeoutId);
      return;
    }

    // Historic sites recommendation simulation
    if (message.toLowerCase().includes('historic') && (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest'))) {
      // 작성중 메시지 추가
      const typingMessage = createTypingMessage();
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      setTimeout(() => {
        const responseContent = 'I recommend Gyeongbokgung Palace, Seodaemun Prison History Hall, and Changdeokgung Palace';
        setMessages(prev => replaceTypingMessage(prev, typingMessage, responseContent));

        // Set route
        const recommendedRoute: Location[] = [
          {
            id: '1',
            name: 'Changdeokgung',
            address: '서울특별시 종로구 율곡로 99',
            lat: 37.5794,
            lng: 126.9910
          },
          {
            id: '2',
            name: 'Gyeongbokgung',
            address: '서울특별시 종로구 사직로 161',
            lat: 37.5796,
            lng: 126.9770
          },
          {
            id: '3',
            name: 'Seodaemun Prison',
            address: '서울특별시 서대문구 통일로 251',
            lat: 37.5744,
            lng: 126.9587
          }
        ];
        setRoute(recommendedRoute);
        setScreen('chatResponse');
      }, 5000);
    } else {
      // '/'로 시작하는 메시지는 검색 키워드로 처리
      const trimmedMessage = message.trim();
      
      if (trimmedMessage.startsWith('/')) {
        // '/'를 제거한 나머지 부분을 검색 키워드로 사용
        const searchKeyword = trimmedMessage.substring(1).trim();
        
        if (searchKeyword.length > 0) {
          setSearchKeyword(searchKeyword);
          setScreen('chatResponse');

          const timeoutId = setTimeout(() => {
            const responseContent = uiLanguage === 'ko'
              ? `"${searchKeyword}" 검색 중...`
              : `Searching for "${searchKeyword}"...`;
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: responseContent
            }]);
          }, 300);
          timeoutRefsRef.current.push(timeoutId);
          return;
        }
      }

      // 그 외에는 모두 OpenAI API로 처리
      // 일반 메시지에 대한 OpenAI API 호출
      // 작성중 메시지 추가
      const typingMessage = createTypingMessage();
      const messagesWithTyping = [...newMessages, typingMessage];
      setMessages(messagesWithTyping);
      setScreen('chatResponse');

      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // OpenAI API 호출
      const CHATBOT_API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || 'http://localhost:9000/chatbot';

      // Onboarding 데이터 가져오기
      let userProfile = null;
      if (typeof window !== 'undefined') {
        try {
          const onboardingDataStr = localStorage.getItem('onboardingData');
          if (onboardingDataStr) {
            userProfile = JSON.parse(onboardingDataStr);
            console.log('사용자 프로필 정보:', userProfile);
          }
        } catch (e) {
          console.warn('Onboarding 데이터 파싱 실패:', e);
        }
      }

      // 현재 위치 및 날씨 정보 준비
      const contextInfo: {
        location?: { lat: number; lng: number };
        weather?: { temp: number; description: string; city: string };
      } = {};

      if (currentLocation) {
        contextInfo.location = currentLocation;
      }

      if (weatherInfo) {
        contextInfo.weather = weatherInfo;
      }

      console.log('컨텍스트 정보 (위치/날씨):', contextInfo);

      // 대화 이력을 API 형식으로 변환 (현재 메시지 제외)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // 타임아웃 설정 (30초)
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);
      timeoutRefsRef.current.push(timeoutId);

      fetch(`${CHATBOT_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          conversation_history: conversationHistory,
          user_profile: userProfile, // Onboarding 데이터
          context_info: Object.keys(contextInfo).length > 0 ? contextInfo : undefined // 위치/날씨 정보
        }),
        signal: controller.signal
      })
        .then(async res => {
          // 타임아웃 제거
          timeoutRefsRef.current = timeoutRefsRef.current.filter(id => id !== timeoutId);
          clearTimeout(timeoutId);

          if (!res.ok) {
            const errorText = await res.text();
            console.error('HTTP 에러 응답:', res.status, errorText);
            throw new Error(`HTTP error! status: ${res.status}`);
          }

          // 응답 본문을 텍스트로 먼저 읽어서 확인
          const responseText = await res.text();
          console.log('응답 원본:', responseText);

          try {
            const data = JSON.parse(responseText);
            console.log('파싱된 응답 데이터:', data);
            return data;
          } catch (parseError) {
            console.error('JSON 파싱 실패:', parseError, '응답 텍스트:', responseText);
            throw new Error('응답 파싱 실패');
          }
        })
        .then(data => {
          console.log('응답 데이터:', data);

          // 응답 구조 확인 및 처리
          let responseContent = null;

          if (data && typeof data === 'object') {
            // data.response가 있는 경우
            if (data.response && typeof data.response === 'string') {
              responseContent = data.response;
            }
            // data.message가 있는 경우
            else if (data.message && typeof data.message === 'string') {
              responseContent = data.message;
            }
            // 중첩된 response 객체가 있는 경우
            else if (data.response && typeof data.response === 'object' && data.response.response) {
              responseContent = data.response.response;
            }
          }

          // 응답을 찾지 못한 경우
          if (!responseContent) {
            console.error('응답 데이터 구조 오류:', data);
            responseContent = uiLanguage === 'ko'
              ? '응답을 받을 수 없습니다.'
              : 'Unable to receive response.';
          }

          console.log('최종 응답 내용:', responseContent);

          // 작성중 메시지를 실제 답변으로 교체
          setMessages(prev => {
            const updated = replaceTypingMessage(prev, typingMessage, responseContent);
            console.log('메시지 업데이트 완료:', updated);
            return updated;
          });
        })
        .catch(error => {
          // 타임아웃 제거
          timeoutRefsRef.current = timeoutRefsRef.current.filter(id => id !== timeoutId);
          clearTimeout(timeoutId);

          // AbortError는 사용자가 취소한 것이므로 로그만 출력
          if (error.name !== 'AbortError') {
            console.error('챗봇 API 호출 실패:', error);
            console.error('에러 상세:', error.message, error.stack);
          }

          // 작성중 메시지를 에러 메시지로 교체
          const errorMessage = uiLanguage === 'ko'
            ? (error.name === 'AbortError'
              ? '응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
              : '죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
            : (error.name === 'AbortError'
              ? 'Request timeout. Please try again later.'
              : 'Sorry, an error occurred. Please try again later.');

          setMessages(prev => replaceTypingMessage(prev, typingMessage, errorMessage));
        });
    }
  };

  const handlePlaceClick = (place: Location) => {
    setSelectedPlace(place);
    // screen은 변경하지 않고 chatResponse 유지
    if (screen === 'initial') {
      setScreen('chatResponse');
    }
  };

  const handleClosePopup = () => {
    setSelectedPlace(null);
    // screen은 변경하지 않음
  };

  const handleReset = () => {
    setMessages([]);
    setRoute([]);
    setSearchKeyword('');
    setSelectedPlace(null);
    setScreen('initial');
    setShowChatbot(true);
    setMapResetKey(prev => prev + 1); // 지도 초기화를 위한 키 증가
    setDrawRouteKey(0); // 경로 그리기 키 초기화
  };

  return (



    <div className="flex h-screen bg-white overflow-hidden relative">
      {/* 사이드바 */}
      <Sidebar
        onToggleChatbot={() => setShowChatbot(!showChatbot)}
        showChatbot={showChatbot}
        onReset={handleReset}
      />

      {/* 날씨 위젯 - 오른쪽 상단 */}
      <div className="absolute top-4 right-4 z-50">
        <WeatherWidget
          onWeatherUpdate={handleWeatherUpdate}
          onLocationUpdate={handleLocationUpdate}
        />
      </div>

      {/* 챗봇과 지도 영역 (리사이저블) */}
      {showChatbot ? (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* 챗봇 */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full flex flex-col border-r">
              {/* 상세 정보 창 (위쪽 절반) */}
              {selectedPlace ? (
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <div className="h-full overflow-hidden">
                      <PlacePopup
                        place={selectedPlace}
                        onClose={() => {
                          setSelectedPlace(null);
                        }}
                      />
                    </div>
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <Chatbot
                      messages={messages}
                      onSendMessage={handleSendMessage}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              ) : (
                <Chatbot
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              )}
            </div>
          </ResizablePanel>

          {/* 리사이저 핸들 */}
          <ResizableHandle withHandle />

          {/* 지도 */}
          <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
            <div className="h-full">
              <KakaoMap
                route={route}
                searchKeyword={searchKeyword}
                onPlaceClick={handlePlaceClick}
                resetKey={mapResetKey}
                drawRouteKey={drawRouteKey}
                onLocationUpdate={handleLocationUpdate}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        /* 지도만 표시 (챗봇 숨김) */
        <div className="flex-1 h-full">
          <KakaoMap
            route={route}
            searchKeyword={searchKeyword}
            onPlaceClick={handlePlaceClick}
            resetKey={mapResetKey}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
      )}
    </div>
  );
}
