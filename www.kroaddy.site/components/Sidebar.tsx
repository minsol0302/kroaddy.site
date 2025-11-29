// @ts-nocheck
"use client";

import React from 'react';
import Image from 'next/image';
import { Languages, User, HeadphonesIcon, Building2, Compass, MessageSquare } from 'lucide-react';

interface SidebarProps {
  onToggleChatbot?: () => void;
  showChatbot?: boolean;
  onReset?: () => void;
}

export function Sidebar({ onToggleChatbot, showChatbot = true, onReset }: SidebarProps) {
  const menuItems = [
    { icon: Languages, label: 'Translate' },
    { icon: User, label: 'My Page' },
    { icon: HeadphonesIcon, label: 'Support' },
    { icon: Building2, label: 'About Us' }
  ];

  return (
    <div className="w-20 bg-white border-r flex flex-col items-center py-6">
      {/* 로고 */}
      <div className="mb-8">
        <button
          onClick={onReset}
          className="flex flex-col items-center hover:opacity-70 transition-opacity cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center mb-1">
            <Image
              src="/logo2.png"
              alt="Kroaddy logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-[10px] text-gray-700">roaddy</span>
        </button>
      </div>

      {/* 메뉴 아이템 */}
      <div className="flex-1 flex flex-col gap-6">
        {/* 챗봇 토글 버튼 */}
        {onToggleChatbot && (
          <button
            onClick={onToggleChatbot}
            className={`flex flex-col items-center gap-1 hover:opacity-70 transition-opacity ${showChatbot ? 'opacity-100' : 'opacity-50'
              }`}
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <span className="text-[9px] text-gray-600">Chat</span>
          </button>
        )}

        {menuItems.map((item, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
          >
            <item.icon className="w-5 h-5 text-gray-600" />
            <span className="text-[9px] text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>

      {/* 탐험모드 버튼 */}
      <button className="mt-auto px-3 py-3 bg-gradient-to-r from-[#0088FF] to-[#FF383C] text-white rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-1">
        <Compass className="w-5 h-5" />
        <span className="text-[9px]">Explore</span>
      </button>
    </div>
  );
}