// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Languages, User, HeadphonesIcon, Building2, Compass, MessageSquare, Phone, MapPin, AlertCircle, AlertTriangle, Shield, Building } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface SidebarProps {
  onToggleChatbot?: () => void;
  showChatbot?: boolean;
  onReset?: () => void;
}

export function Sidebar({ onToggleChatbot, showChatbot = true, onReset }: SidebarProps) {
  const router = useRouter();
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);

  const menuItems = [
    { icon: User, label: 'My Page', path: '/mypage' },
    { icon: HeadphonesIcon, label: 'Support', path: null },
    { icon: Building2, label: 'About Us', path: null }
  ];

  const languages = [
    { name: '한국어', native: '한국어', country: 'South Korea' },
    { name: 'English', native: 'English', country: 'United States' },
    { name: '日本語', native: '日本語', country: 'Japan' },
    { name: '简体中文', native: '简体中文', country: 'China' },
    { name: '繁體中文', native: '繁體中文', country: 'Taiwan' },
    { name: 'Français', native: 'Français', country: 'France' },
    { name: 'Deutsch', native: 'Deutsch', country: 'Germany' },
    { name: 'Tiếng Việt', native: 'Tiếng Việt', country: 'Vietnam' },
    { name: 'Italiano', native: 'Italiano', country: 'Italy' },
    { name: 'العربية', native: 'العربية', country: 'Saudi Arabia' },
    { name: 'Bahasa Indonesia', native: 'Bahasa Indonesia', country: 'Indonesia' },
    { name: 'ไทย', native: 'ไทย', country: 'Thailand' },
    { name: 'монгол', native: 'монгол', country: 'Mongolia' },
    { name: 'Português', native: 'Português', country: 'Brazil' },
    { name: 'Español', native: 'Español', country: 'Spain' },
    { name: 'oʻzbekcha', native: 'oʻzbekcha', country: 'Uzbekistan' },
    { name: 'ខ្មែរ', native: 'ខ្មែរ', country: 'Cambodia' },
    { name: 'नेपाली', native: 'नेपाली', country: 'Nepal' },
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
            onClick={() => item.path && router.push(item.path)}
            className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
          >
            <item.icon className="w-5 h-5 text-gray-600" />
            <span className="text-[9px] text-gray-600">{item.label}</span>
          </button>
        ))}

        {/* Languages 버튼 - About Us 바로 아래 */}
        <button
          onClick={() => setIsLanguageDialogOpen(true)}
          className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <Languages className="w-5 h-5 text-gray-600" />
          <span className="text-[9px] text-gray-600">Languages</span>
        </button>
      </div>

      {/* 응급사항항 버튼 */}
      <button
        onClick={() => setIsEmergencyDialogOpen(true)}
        className="mt-auto px-3 py-3 bg-red-500 text-white rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-1"
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="text-[9px]">emergency</span>
      </button>

      {/* 언어 선택 다이얼로그 */}
      <Dialog open={isLanguageDialogOpen} onOpenChange={setIsLanguageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>언어 선택</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {languages.map((lang, index) => (
              <button
                key={index}
                onClick={() => {
                  // 언어 선택 로직 추가 가능
                  setIsLanguageDialogOpen(false);
                }}
                className="text-left p-2 rounded hover:bg-gray-100 transition-colors text-sm"
              >
                <div className="font-medium">{lang.native}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {lang.name} ({lang.country})
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency 다이얼로그 */}
      <Dialog open={isEmergencyDialogOpen} onOpenChange={setIsEmergencyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Emergency</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Emergency Report */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-lg">Emergency Report</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.location.href = 'tel:112';
                    setIsEmergencyDialogOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/70 text-white rounded-lg hover:bg-red-600/70 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>TEL</span>
                </button>
                <button
                  onClick={() => {
                    // 경로 안내 로직 추가 가능
                    setIsEmergencyDialogOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/70 text-white rounded-lg hover:bg-blue-600/70 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Route guidance</span>
                </button>
              </div>
            </div>

            {/* Police */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-lg">Police</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.location.href = 'tel:112';
                    setIsEmergencyDialogOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/70 text-white rounded-lg hover:bg-red-600/70 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>TEL</span>
                </button>
                <button
                  onClick={() => {
                    // 경로 안내 로직 추가 가능
                    setIsEmergencyDialogOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/70 text-white rounded-lg hover:bg-blue-600/70 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Route guidance</span>
                </button>
              </div>
            </div>

            {/* Embassy */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-lg">Embassy</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // 대사관 전화번호 로직 추가 가능
                    setIsEmergencyDialogOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/70 text-white rounded-lg hover:bg-red-600/70 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>TEL</span>
                </button>
                <button
                  onClick={() => {
                    // 경로 안내 로직 추가 가능
                    setIsEmergencyDialogOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/70 text-white rounded-lg hover:bg-blue-600/70 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Route guidance</span>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}