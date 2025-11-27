// @ts-nocheck
"use client";

import React from 'react';
import { Search, CloudSun, Music2, Trees, Bike, Landmark, Building } from 'lucide-react';
import { Location } from '../lib/types';
import { ImageWithFallback } from './ImageWithFallback';

interface MapViewProps {
  route: Location[];
  onPlaceClick: (place: Location) => void;
  showRoute: boolean;
}

export function MapView({ route, onPlaceClick, showRoute }: MapViewProps) {
  const mapOptions = [
    { icon: Music2, label: 'K-POP', color: 'from-[#FF383C] to-[#FF383C]/80' },
    { icon: Trees, label: 'Nature', color: 'from-[#0088FF] to-[#0088FF]/80' },
    { icon: Bike, label: 'Activity', color: 'from-[#FF383C] to-[#FF383C]/80' },
    { icon: Landmark, label: 'Historic Sites', color: 'from-[#0088FF] to-[#0088FF]/80' },
    { icon: Building, label: 'Museums', color: 'from-[#FF383C] to-[#FF383C]/80' }
  ];

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* 검색바 */}
      <div className="absolute top-6 left-6 right-6 z-10">
        <div className="bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for places..."
            className="flex-1 outline-none"
          />
        </div>
      </div>

      {/* 날씨 아이콘 */}
      <div className="absolute top-6 right-6 z-10">
        <button className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow">
          <CloudSun className="w-6 h-6 text-[#0088FF]" />
        </button>
      </div>

      {/* 지도 옵션 버튼들 */}
      <div className="absolute top-24 right-6 z-10 flex flex-col gap-2">
        {mapOptions.map((option, index) => (
          <button
            key={index}
            className={`bg-white rounded-xl px-4 py-2 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group hover:bg-gradient-to-r ${option.color}`}
          >
            <option.icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
            <span className="text-sm text-gray-700 group-hover:text-white transition-colors">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* 지도 영역 (Mock) */}
      <div className="w-full h-full relative">
        {/* 배경 지도 이미지 */}
        <ImageWithFallback
          src="https://images.unsplash.com/flagged/photo-1580051720305-a944536881fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTZW91bCUyMGNpdHklMjBtYXB8ZW58MXx8fHwxNzYzNDU0NTAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Seoul Map"
          className="w-full h-full object-cover"
        />

        {/* 반투명 오버레이 */}
        <div className="absolute inset-0 bg-white/30"></div>

        {/* 서울역 중심 표시 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-[#0088FF] rounded-full animate-ping absolute"></div>
            <div className="w-4 h-4 bg-[#0088FF] rounded-full relative"></div>
            <span className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
              Seoul Station
            </span>
          </div>
        </div>

        {/* 경로 및 마커 표시 */}
        {showRoute && route.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {/* 경로선 그리기 */}
            {route.map((location, index) => {
              if (index === route.length - 1) return null;
              const next = route[index + 1];

              // 화면 중앙 기준으로 상대 위치 계산
              const x1 = `${50 + (index - 1) * 15}%`;
              const y1 = `${40 + (index % 2) * 10}%`;
              const x2 = `${50 + index * 15}%`;
              const y2 = `${40 + ((index + 1) % 2) * 10}%`;

              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#0088FF"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              );
            })}
          </svg>
        )}

        {/* 장소 마커들 */}
        {showRoute && route.map((location, index) => {
          const positions = [
            { left: '35%', top: '40%' }, // 창덕궁
            { left: '50%', top: '50%' }, // 경복궁
            { left: '65%', top: '40%' }  // 서대문형무소역사관
          ];

          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
              style={positions[index]}
              onClick={() => onPlaceClick(location)}
            >
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF383C] to-[#FF383C]/80 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs">{location.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}