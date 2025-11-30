// @ts-nocheck
"use client";

import React, { useState, useEffect } from 'react';
import { Send, Languages } from 'lucide-react';
import { Message, LanguageCode } from '../lib/types';
import { translateText, getLanguageCode, detectLanguage } from '../service/translateService';
import { t, getCurrentLanguage } from '../lib/i18n';

interface ChatbotProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
}

export function Chatbot({ messages, onSendMessage }: ChatbotProps) {
  const [input, setInput] = useState('');
  const [isTranslateEnabled, setIsTranslateEnabled] = useState(false);
  const [translatedMessages, setTranslatedMessages] = useState<Message[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<LanguageCode>('ko');
  const [uiLanguage, setUiLanguage] = useState<LanguageCode>(getCurrentLanguage());

  // 선택된 언어 가져오기 및 변경 감지
  useEffect(() => {
    const updateTargetLanguage = () => {
      const currentLang = typeof window !== 'undefined'
        ? localStorage.getItem('selectedLanguage') || '한국어'
        : '한국어';
      const targetLang = getLanguageCode(currentLang);
      setSelectedTargetLanguage(targetLang);
    };

    // 초기 언어 설정
    updateTargetLanguage();

    const handleLanguageChange = (event: CustomEvent) => {
      updateTargetLanguage();
      // UI 언어도 업데이트
      setUiLanguage(getCurrentLanguage());
      // 언어 변경 시 번역 재실행
      if (isTranslateEnabled) {
        translateAllMessages();
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, [isTranslateEnabled]);

  // 번역 활성화 시 메시지 번역
  useEffect(() => {
    if (isTranslateEnabled && messages.length > 0) {
      translateAllMessages();
    } else {
      setTranslatedMessages(messages);
    }
  }, [isTranslateEnabled, messages, selectedTargetLanguage]);

  const translateAllMessages = async () => {
    setIsTranslating(true);
    try {
      const translated = await Promise.all(
        messages.map(async (msg) => {
          // 사용자 메시지는 원본 그대로 유지
          if (msg.role === 'user') {
            return { ...msg, content: msg.content };
          }

          // Assistant 메시지만 번역
          // 각 메시지의 언어를 감지
          const detectedLang = await detectLanguage(msg.content);

          // 감지된 언어가 선택한 언어와 같으면 번역 불필요
          if (detectedLang === selectedTargetLanguage) {
            return { ...msg, content: msg.content };
          }

          // 감지된 언어 → 선택한 언어로 번역
          const translatedText = await translateText(msg.content, detectedLang, selectedTargetLanguage);
          return { ...msg, translatedContent: translatedText, content: translatedText };
        })
      );
      setTranslatedMessages(translated);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedMessages(messages);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // 입력한 메시지는 번역하지 않고 원본 그대로 전송
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
              <h2 className="text-gray-900">{t('chatbot.title', uiLanguage)}</h2>
              <p className="text-xs text-gray-500">{t('chatbot.subtitle', uiLanguage)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{t('chatbot.translate', uiLanguage)}</span>
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
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative">
        {isTranslating && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-10">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {t('chatbot.translating', uiLanguage)}
          </div>
        )}

        {(isTranslateEnabled ? translatedMessages : messages).length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>{t('chatbot.welcome.title', uiLanguage)}</p>
            <p className="text-xs mt-2">{t('chatbot.welcome.subtitle', uiLanguage)}</p>
          </div>
        ) : (
          (isTranslateEnabled ? translatedMessages : messages).map((message, index) => (
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
                {isTranslateEnabled && message.role === 'assistant' && message.translatedContent && message.translatedContent !== message.content && (
                  <p className="text-xs mt-1 opacity-70 italic">(Translated)</p>
                )}
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
            placeholder={t('chatbot.placeholder', uiLanguage)}
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
