// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Message } from '../lib/types';

interface ChatbotProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}



export function Chatbot({ messages, onSendMessage }: ChatbotProps) {
  const [input, setInput] = useState('');

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0088FF] to-[#FF383C] flex items-center justify-center">
            <span className="text-white">R</span>
          </div>
          <div>
            <h2 className="text-gray-900">roaddy</h2>
            <p className="text-xs text-gray-500">AI Travel Assistant</p>
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
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
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