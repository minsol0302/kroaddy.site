// @ts-nocheck

"use client";

import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Chatbot } from "../../components/Chatbot";
import KakaoMap from "../../components/KakaoMap";
import { PlacePopup } from "../../components/PlacePopup";
import { Message, Location } from "../../lib/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../../components/ui/resizable";

export type Screen = 'initial' | 'chatResponse' | 'placeDetail';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('initial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Location | null>(null);
  const [route, setRoute] = useState<Location[]>([]);
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
          { name: 'Changdeokgung', lat: 37.5794, lng: 126.9910 },
          { name: 'Gyeongbokgung', lat: 37.5796, lng: 126.9770 },
          { name: 'Seodaemun Prison', lat: 37.5744, lng: 126.9587 }
        ];
        setRoute(recommendedRoute);
        setScreen('chatResponse');
      }, 500);
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
  };

  const handlePlaceClick = (place: Location) => {
    setSelectedPlace(place);
    setScreen('placeDetail');
  };

  const handleClosePopup = () => {
    setSelectedPlace(null);
    setScreen('chatResponse');
  };

  const handleReset = () => {
    setMessages([]);
    setRoute([]);
    setSelectedPlace(null);
    setScreen('initial');
    setShowChatbot(true);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 사이드바 */}
      <Sidebar
        onToggleChatbot={() => setShowChatbot(!showChatbot)}
        showChatbot={showChatbot}
        onReset={handleReset}
      />

      {/* 챗봇과 지도 영역 (리사이저블) */}
      {(screen === 'initial' || screen === 'chatResponse') ? (
        showChatbot ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* 챗봇 */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <div className="h-full flex flex-col border-r">
                <Chatbot
                  messages={messages}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </ResizablePanel>

            {/* 리사이저 핸들 */}
            <ResizableHandle withHandle />

            {/* 지도 */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <div className="h-full">
                <KakaoMap />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* 지도만 표시 (챗봇 숨김) */
          <div className="flex-1 h-full">
            <KakaoMap />
          </div>
        )
      ) : (
        <>
          {/* 장소 상세 팝업 (세 번째 화면) */}
          {selectedPlace && (
            <PlacePopup
              place={selectedPlace}
              onClose={handleClosePopup}
            />
          )}

          {/* 지도 (전체 화면) */}
          <div className="flex-1 h-full">
            <KakaoMap />
          </div>
        </>
      )}
    </div>
  );
}
