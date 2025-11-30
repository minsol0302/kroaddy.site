// @ts-nocheck

"use client";


import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Chatbot } from "../../components/Chatbot";
import KakaoMap from "../../components/KakaoMap";
import { PlacePopup } from "../../components/PlacePopup";
import { WeatherWidget } from "../../components/WeatherWidget";
import { Message, Location } from "../../lib/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../components/ui/resizable";
import { keywordPlaceMap } from "../../lib/keywordPlaces";


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

  const handleSendMessage = (message: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);

    // '근처' 키워드 처리
    if (message.includes('근처')) {
      // 작성중 메시지 추가
      const typingMessage: Message = {
        role: 'assistant',
        content: '작성중...'
      };
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      setTimeout(() => {
        const responseContent = `당연하지! 너의 현재 위치는 동대문 디자인 플라자야. 내가 너의 정보에 맞춰서 장소를 추천해줄게.

---

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

---

**이 경로를 선택할래?**`;

        const response: Message = {
          role: 'assistant',
          content: responseContent
        };
        // 작성중 메시지를 실제 답변으로 교체
        setMessages([...newMessages, response]);

        // '근처' 키워드에 매핑된 장소들을 route로 설정
        if (keywordPlaceMap['근처']) {
          setRoute(keywordPlaceMap['근처']);
          setSearchKeyword(''); // 기존 검색 로직과 충돌 방지
        }
        setScreen('chatResponse');
      }, 5000);
      return;
    }

    // '박물관' 키워드 처리
    if (message.includes('박물관')) {
      // 작성중 메시지 추가
      const typingMessage: Message = {
        role: 'assistant',
        content: '작성중...'
      };
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      setTimeout(() => {
        const responseContent = `🏛️ 서울 역사 박물관 (Seoul Museum of History)

서울이 어떻게 지금의 도시가 되었는지 한눈에 볼 수 있는 박물관이야. 조선시대 한양부터 현대 서울까지 변화 과정을 스토리처럼 정리해놔서 외국인들도 이해하기 쉬워. 도시의 과거·현재 감성을 동시에 느낄 수 있는 곳!

---

🇰🇷 대한민국 역사 박물관 (National Museum of Korean Contemporary History)

한국의 현대사만 집중적으로 보여주는 곳이야. 전쟁, 산업화, 민주화 같은 굵직한 사건들을 쉽고 생생하게 구성해놔서, 한국 사회가 어떻게 발전해 왔는지 빠르게 이해할 수 있어. 외국인 방문객들에게 특히 인기 많아.

---

👑 국립 고궁 박물관 (National Palace Museum of Korea)

조선 왕실의 문화와 유물이 가득한 박물관이야. 왕이 쓰던 생활도구부터 화려한 의식용 물품까지 전시돼 있어서, 궁궐 문화에 관심 있는 사람들은 완전 좋아할 스타일! 경복궁 바로 옆이라 동선도 최고야.

---

🏡 국립 민속 박물관 (National Folk Museum of Korea)

한국인의 옛날 생활 문화를 재현해둔 박물관이야. 전통 의식주, 풍습, 도구들이 진짜처럼 꾸며져 있어서 시간여행 온 느낌! 한국인의 일상과 전통을 깊게 알고 싶은 외국인들에게 완전 찰떡이야.

---

🏛️ 국립 중앙 박물관 (National Museum of Korea)

한국에서 가장 큰 국립 박물관으로, 선사시대부터 조선까지 한국 역사를 통째로 보여줘. 규모도 크고 전시품도 세계급이라 한 번 들어가면 시간 순삭! 한국 역사와 예술을 폭넓게 이해하고 싶은 사람들은 꼭 가야 하는 명소야.`;

        const response: Message = {
          role: 'assistant',
          content: responseContent
        };
        // 작성중 메시지를 실제 답변으로 교체
        setMessages([...newMessages, response]);

        // '박물관' 키워드에 매핑된 장소들을 route로 설정
        if (keywordPlaceMap['박물관']) {
          setRoute(keywordPlaceMap['박물관']);
          setSearchKeyword(''); // 기존 검색 로직과 충돌 방지
        }
        setScreen('chatResponse');
      }, 5000);
      return;
    }

    // '추천' 키워드 처리
    if (message.includes('추천')) {
      // 작성중 메시지 추가
      const typingMessage: Message = {
        role: 'assistant',
        content: '작성중...'
      };
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      setTimeout(() => {
        const responseContent = `이 곳은 어때? 리뷰도 좋고! 인기가 많은 식당이야!

---

## 🌸 꽃밥에 피다 북촌 친환경 그로서란트

전통 가옥 분위기 속에서 건강하고 자연 친화적인 식재료를 판매하고 식사도 가능한 공간이다. 북촌의 한옥 감성과 로컬 재료 중심의 식단이 외국인들에게 특히 매력적이야

---

**최적의 경로를 추천해줄까?**`;

        const response: Message = {
          role: 'assistant',
          content: responseContent
        };
        // 작성중 메시지를 실제 답변으로 교체
        setMessages([...newMessages, response]);

        // 기존 route에서 특정 장소 제거하고 새 장소 추가
        if (keywordPlaceMap['근처']) {
          const basePlaces = keywordPlaceMap['근처'];

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
      return;
    }

    // '응' 키워드 처리
    if (message.includes('응')) {
      // 작성중 메시지 추가
      const typingMessage: Message = {
        role: 'assistant',
        content: '작성중...'
      };
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      setTimeout(() => {
        const responseContent = `그래 좋아 네가 이동하면서 장소의 숨겨진 이야기를 알려줄게! 도움이 필요하면 언제든지 물어봐!`;

        const response: Message = {
          role: 'assistant',
          content: responseContent
        };
        // 작성중 메시지를 실제 답변으로 교체
        setMessages([...newMessages, response]);

        // 경로를 그리기 위해 drawRouteKey 증가
        if (route.length > 0) {
          setDrawRouteKey(prev => prev + 1);
        }

        setScreen('chatResponse');
      }, 5000);
      return;
    }

    // Historic sites recommendation simulation
    if (message.toLowerCase().includes('historic') && (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest'))) {
      // 작성중 메시지 추가
      const typingMessage: Message = {
        role: 'assistant',
        content: '작성중...'
      };
      setMessages([...newMessages, typingMessage]);
      setScreen('chatResponse');

      setTimeout(() => {
        const response: Message = {
          role: 'assistant',
          content: 'I recommend Gyeongbokgung Palace, Seodaemun Prison History Hall, and Changdeokgung Palace'
        };
        setMessages([...newMessages, response]);

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
      // 키워드 검색 처리 (특정 키워드가 없으면 일반 검색으로 간주)
      // "search", "find", "찾기" 등의 키워드가 있거나, 메시지가 장소명일 가능성이 있는 경우
      const trimmedMessage = message.trim();
      if (trimmedMessage.length > 0) {
        // 키워드 검색으로 처리
        setSearchKeyword(trimmedMessage);
        setScreen('chatResponse');

        setTimeout(() => {
          const response: Message = {
            role: 'assistant',
            content: `Searching for "${trimmedMessage}"...`
          };
          setMessages([...newMessages, response]);
        }, 300);
      } else {
        // 일반 메시지에 대한 응답
        // 작성중 메시지 추가
        const typingMessage: Message = {
          role: 'assistant',
          content: '작성중...'
        };
        setMessages([...newMessages, typingMessage]);
        setScreen('chatResponse');

        setTimeout(() => {
          const response: Message = {
            role: 'assistant',
            content: `I received your message: "${message}". This is a placeholder response.`
          };
          setMessages([...newMessages, response]);
        }, 5000);
      }
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
        <WeatherWidget />
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
              <KakaoMap route={route} searchKeyword={searchKeyword} onPlaceClick={handlePlaceClick} resetKey={mapResetKey} drawRouteKey={drawRouteKey} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        /* 지도만 표시 (챗봇 숨김) */
        <div className="flex-1 h-full">
          <KakaoMap route={route} searchKeyword={searchKeyword} onPlaceClick={handlePlaceClick} resetKey={mapResetKey} />
        </div>
      )}
    </div>
  );
}
