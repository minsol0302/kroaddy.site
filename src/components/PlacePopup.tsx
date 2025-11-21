// @ts-nocheck
"use client";

import React from 'react';
import { X, Info, MessageCircle, BookOpen, AlertTriangle, Star, DollarSign } from 'lucide-react';
import { Location } from '../lib/types';
import { ImageWithFallback } from './ImageWithFallback';

interface PlacePopupProps {
  place: Location;
  onClose: () => void;
}

export function PlacePopup({ place, onClose }: PlacePopupProps) {
  const tabs = [
    { icon: Info, label: 'Info', color: 'from-[#0088FF] to-[#0088FF]/80' },
    { icon: MessageCircle, label: 'Phrases', color: 'from-[#FF383C] to-[#FF383C]/80' },
    { icon: BookOpen, label: 'Story', color: 'from-[#0088FF] to-[#0088FF]/80' },
    { icon: AlertTriangle, label: 'Tips', color: 'from-[#FF383C] to-[#FF383C]/80' },
    { icon: Star, label: 'Reviews', color: 'from-[#0088FF] to-[#0088FF]/80' },
    { icon: DollarSign, label: 'Pricing', color: 'from-[#FF383C] to-[#FF383C]/80' }
  ];

  return (
    <div className="w-[30%] bg-white border-l flex flex-col shadow-xl relative">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* 장소 이미지 */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1693928105512-10516b969717?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHeWVvbmdib2tndW5nJTIwUGFsYWNlJTIwU2VvdWx8ZW58MXx8fHwxNzYzNDU0MTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt={place.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h2 className="text-white text-2xl">{place.name}</h2>
          <p className="text-white/80 text-sm mt-1">Representative Palace of Joseon Dynasty</p>
        </div>
      </div>

      {/* 탭 아이콘들 */}
      <div className="grid grid-cols-3 gap-3 p-6 border-b">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tab.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <tab.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-gray-700">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-gray-900 mb-2">Basic Information</h3>
            <p className="text-sm text-gray-600">
              Gyeongbokgung was built in 1395 as the main royal palace of the Joseon Dynasty.
              The name means &quot;Palace Greatly Blessed by Heaven&quot; and it is the largest and most magnificent of all Joseon palaces.
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-gray-900 mb-2">Operating Hours</h3>
            <p className="text-sm text-gray-600">09:00 - 18:00 (Closed on Mondays)</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-gray-900 mb-2">Admission Fee</h3>
            <p className="text-sm text-gray-600">Adults ₩3,000 / Youth ₩1,500</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-gray-900 mb-2">Address</h3>
            <p className="text-sm text-gray-600">161 Sajik-ro, Jongno-gu, Seoul, South Korea</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-gray-900 mb-2">Recommended Route</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Gwanghwamun → Geunjeongjeon → Gyeonghoeru → Hyangwonjeong</li>
              <li>• Duration: Approx. 2 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}