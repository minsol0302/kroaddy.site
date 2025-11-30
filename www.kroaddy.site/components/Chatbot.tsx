// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Send, Languages, Music, TreePine, Activity, BookOpen, Building2 } from 'lucide-react';
import { Message } from '../lib/types';

interface ChatbotProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}



export function Chatbot({ messages, onSendMessage }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [isTranslateEnabled, setIsTranslateEnabled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 헤더 */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0088FF] to-[#FF383C] flex items-center justify-center">
              <span className="text-white">R</span>
            </div>
            <div>
              <h2 className="text-gray-900">roaddy</h2>
              <p className="text-xs text-gray-500">AI Travel Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Translate</span>
            <button
              onClick={() => setIsTranslateEnabled(!isTranslateEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${isTranslateEnabled
                ? 'bg-green-500 focus:ring-green-500'
                : 'bg-gray-300 focus:ring-gray-400'
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${isTranslateEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>Hello! Where would you like to travel?</p>
            <p className="text-xs mt-2">Ask about places or categories you&apos;re interested in</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                  ? 'bg-gradient-to-r from-[#0088FF] to-[#0088FF]/90 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <div 
                  className={`text-sm whitespace-pre-wrap ${message.role === 'assistant' ? 'prose prose-sm max-w-none' : ''}`}
                  style={{
                    lineHeight: '1.6',
                  }}
                >
                  {message.role === 'assistant' ? (
                    <div className="space-y-4">
                      {message.content.split('\n').map((line, idx) => {
                        // 제목 처리 (## 로 시작)
                        if (line.trim().startsWith('## ')) {
                          const title = line.replace('## ', '').trim();
                          return (
                            <h3 key={idx} className="font-bold text-base mt-4 mb-2 text-gray-900">
                              {title}
                            </h3>
                          );
                        }
                        // 구분선 처리 (---)
                        if (line.trim() === '---') {
                          return <hr key={idx} className="my-3 border-gray-300" />;
                        }
                        // 굵은 텍스트 처리 (**로 감싸진 텍스트)
                        if (line.includes('**')) {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={idx} className="mb-2">
                              {parts.map((part, partIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={partIdx} className="font-semibold">{part.slice(2, -2)}</strong>;
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                            </p>
                          );
                        }
                        // 빈 줄 처리
                        if (line.trim() === '') {
                          return <br key={idx} />;
                        }
                        // 일반 텍스트
                        return (
                          <p key={idx} className="mb-2 text-gray-700">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 카테고리 버튼 영역 */}
      <div className="px-6 pb-4 border-t bg-white">
        <div className="flex gap-3 overflow-x-auto py-4 scrollbar-hide">
          {[
            { icon: Music, label: 'K-POP', color: 'bg-pink-500' },
            { icon: TreePine, label: '자연', color: 'bg-green-500' },
            { icon: Activity, label: '액티비티', color: 'bg-orange-500' },
            { icon: BookOpen, label: '역사', color: 'bg-amber-500' },
            { icon: Building2, label: '박물관', color: 'bg-purple-500' },
          ].map((category, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(category.label)}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all whitespace-nowrap flex-shrink-0"
            >
              <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="p-6 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0088FF] focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-[#0088FF] to-[#FF383C] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}