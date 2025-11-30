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


export type Screen = 'initial' | 'chatResponse' | 'placeDetail';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('initial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null);
  const [route, setRoute] = useState<Location[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showChatbot, setShowChatbot] = useState(true);

  const handleSendMessage = (message: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(newMessages);

    // Historic sites recommendation simulation
    if (message.toLowerCase().includes('historic') && (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggest'))) {
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
      }, 500);
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
        setTimeout(() => {
          const response: Message = {
            role: 'assistant',
            content: `I received your message: "${message}". This is a placeholder response.`
          };
          setMessages([...newMessages, response]);
        }, 500);
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
              <KakaoMap route={route} searchKeyword={searchKeyword} onPlaceClick={handlePlaceClick} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        /* 지도만 표시 (챗봇 숨김) */
        <div className="flex-1 h-full">
          <KakaoMap route={route} searchKeyword={searchKeyword} onPlaceClick={handlePlaceClick} />
        </div>
      )}
    </div>
  );
}
