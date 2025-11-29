// components/Onboarding.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Onboarding() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        gender: '',
        age: '',
        nationality: '',
        religion: '',
        dietary: '',
    });

    const questions = [
        { key: 'gender', question: '안녕! 반가워요~ 😊\n성별이 어떻게 되시나요?', options: ['남성', '여성', '기타/비공개'] },
        { key: 'age', question: '좋아요! 몇 살이세요?', placeholder: '예: 28' },
        { key: 'nationality', question: '어느 나라에서 오셨어요? 🌏', placeholder: '예: 대한민국' },
        { key: 'religion', question: '종교가 있으신가요?\n(없으면 "무교"라고 적어주세요)', placeholder: '예: 무교, 기독교, 불교 등' },
        { key: 'dietary', question: '마지막으로 하나만 더!\n식습관은 어떠신가요?', options: ['일반식', '채식(락토/오보)', '비건', '페스코', '기타'] },
    ];

    const current = questions[step];

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            // 모든 질문 완료 → API 호출 후 홈으로 이동
            console.log('완료된 데이터:', formData);
            // TODO: 여기서 온보딩 데이터를 백엔드로 전송
            // API 호출 후 홈으로 이동
            router.replace('/home');
        }
    };

    const handleInput = (value: string) => {
        setFormData({ ...formData, [current.key]: value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-blue-50 flex items-center justify-center px-6">
            <div className="max-w-md w-full flex flex-col items-center space-y-10">
                {/* 캐릭터 */}
                <div className="relative">
                    <Image
                        src="/character.png"
                        alt="해태 캐릭터"
                        width={320}
                        height={320}
                        className="drop-shadow-2xl"
                        priority
                    />

                    {/* 말풍선 */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-80">
                        <div className="relative bg-white rounded-3xl px-8 py-6 shadow-xl">
                            {/* 꼬리 */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                                <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-transparent border-t-white"></div>
                            </div>

                            <p className="text-lg text-center text-gray-800 whitespace-pre-line leading-relaxed font-medium">
                                {current.question}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 입력 영역 */}
                <div className="w-full space-y-6 animate-in slide-in-from-bottom duration-500">
                    {current.options ? (
                        <div className="grid grid-cols-1 gap-3">
                            {current.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        handleInput(option);
                                        handleNext();
                                    }}
                                    className={`py-4 rounded-2xl font-medium text-lg transition-all ${formData[current.key as keyof typeof formData] === option
                                        ? 'bg-orange-500 text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-800 shadow-md hover:shadow-lg hover:scale-105'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder={current.placeholder || ''}
                                value={formData[current.key as keyof typeof formData]}
                                onChange={(e) => handleInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && formData[current.key as keyof typeof formData] && handleNext()}
                                className="px-6 py-4 rounded-2xl bg-white shadow-md text-center text-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                                autoFocus
                            />
                            <button
                                onClick={handleNext}
                                disabled={!formData[current.key as keyof typeof formData]}
                                className="py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all"
                            >
                                다음 →
                            </button>
                        </div>
                    )}

                    {/* 진행률 */}
                    <div className="flex justify-center gap-2 pt-6">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-12 rounded-full transition-all ${i <= step ? 'bg-orange-500' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}