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
        { key: 'gender', question: '😊\nWhat is your gender?', options: ['Male', 'Female', 'Other/Non-disclosure'] },
        { key: 'age', question: 'Good! How old are you?', placeholder: 'Example: 32' },
        { key: 'nationality', question: 'Where are you from? 🌏', options: ['South Korea', 'United States', 'China', 'Japan', 'Vietnam', 'Thailand', 'Philippines', 'India', 'United Kingdom', 'Others'] },
        { key: 'religion', question: 'Do you have a religion?', options: ['No Religion', 'Christianity', 'Islam', 'Buddhism', 'Others'] },
        { key: 'dietary', question: 'One last question! 🍽️\nWhat is your dietary habit?', options: ['Normal', 'Vegetarian(Lacto/Ovo)', 'Vegan', 'Pescetarian', 'Other'] },
    ];

    const current = questions[step];
    const progress = ((step + 1) / questions.length) * 100;

    const handleNext = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            // 모든 질문 완료 → 로컬 스토리지에 저장 후 홈으로 이동
            console.log('완료된 데이터:', formData);

            // 로컬 스토리지에 온보딩 데이터 저장
            if (typeof window !== 'undefined') {
                localStorage.setItem('onboardingData', JSON.stringify(formData));
                localStorage.setItem('onboardingCompletedAt', new Date().toISOString());
            }

            // TODO: 여기서 온보딩 데이터를 백엔드로 전송
            // API 호출 후 홈으로 이동
            router.replace('/home');
        }
    };

    const handleInput = (value: string) => {
        setFormData({ ...formData, [current.key]: value });
    };

    const handleOptionSelect = (value: string) => {
        handleInput(value);
        // 옵션 선택 시 자동으로 다음으로 이동
        setTimeout(() => {
            handleNext();
        }, 300);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-8"
            style={{
                backgroundImage: 'url(/paper2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* 모달 오버레이 */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto outline-none">
                {/* 헤더 */}
                <div className="px-8 pt-8 pb-4">
                    <div className="mb-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="relative logo-container">
                                <div className="absolute inset-0 animate-pulse-slow blur-3xl opacity-20 bg-gradient-to-r from-red-400 via-blue-400 to-red-400"></div>
                                <Image
                                    src="/logo3.png"
                                    alt="Kroaddy"
                                    width={240}
                                    height={240}
                                    priority
                                    className="w-32 sm:w-40 md:w-48 h-auto relative animate-float logo-shadow"
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold animate-float-subtle" style={{ color: '#0A0A0A' }}>"Personalize your route. Just a few details."</h1>
                    </div>

                    {/* 진행 바 */}
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-black transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* 질문 영역 */}
                <div className="px-8 py-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center whitespace-pre-line leading-relaxed">
                        {current.question}
                    </h2>

                    {/* 옵션 또는 입력 */}
                    <div>
                        {current.options ? (
                            <div className="flex flex-wrap gap-3 justify-center">
                                {current.options.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleOptionSelect(option)}
                                        className={`py-4 px-6 rounded-xl text-center font-medium transition-all duration-200 whitespace-nowrap border ${formData[current.key as keyof typeof formData] === option
                                            ? 'bg-black text-white shadow-md border-black'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border-gray-300'
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type={current.key === 'age' ? 'number' : 'text'}
                                    placeholder={current.placeholder || ''}
                                    value={formData[current.key as keyof typeof formData]}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // age 필드일 때 숫자만 허용
                                        if (current.key === 'age') {
                                            // 숫자만 허용 (빈 문자열도 허용)
                                            if (value === '' || /^\d+$/.test(value)) {
                                                handleInput(value);
                                            }
                                        } else {
                                            handleInput(value);
                                        }
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && formData[current.key as keyof typeof formData] && handleNext()}
                                    className="w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                                    autoFocus
                                    min={current.key === 'age' ? 1 : undefined}
                                    max={current.key === 'age' ? 150 : undefined}
                                />
                                <button
                                    onClick={handleNext}
                                    disabled={!formData[current.key as keyof typeof formData]}
                                    className="w-full py-4 px-6 rounded-xl bg-black text-white font-semibold text-lg shadow-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    Continue →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}