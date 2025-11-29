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
        { key: 'gender', question: 'Hey! Nice to meet you! 😊\nWhat is your gender?', options: ['Male', 'Female', 'Other/Non-disclosure'] },
        { key: 'age', question: 'Good! How old are you?', placeholder: 'Example: 28' },
        { key: 'nationality', question: 'Where are you from? 🌏', placeholder: 'Example: Korea' },
        { key: 'religion', question: 'Do you have a religion?\n(If you don\'t have one, write "None")', placeholder: 'Example: None, Christian, Buddhist, etc.' },
        { key: 'dietary', question: 'One last question! 🍽️\nWhat is your dietary habit?', options: ['Normal', 'Vegetarian(Lacto/Ovo)', 'Vegan', 'Pescetarian', 'Other'] },
    ];

    const current = questions[step];
    const progress = ((step + 1) / questions.length) * 100;

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

    const handleOptionSelect = (value: string) => {
        handleInput(value);
        // 옵션 선택 시 자동으로 다음으로 이동
        setTimeout(() => {
            handleNext();
        }, 300);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                backgroundImage: 'url(/paper2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* 모달 오버레이 */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* 헤더 */}
                <div className="px-8 pt-8 pb-4">
                    <div className="mb-6 flex justify-center">
                        <Image
                            src="/logo3.png"
                            alt="Kroaddy"
                            width={150}
                            height={50}
                            className="mb-2"
                            priority
                        />
                    </div>

                    {/* 진행 바 */}
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-purple-600 transition-all duration-300 ease-out"
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
                    <div className="space-y-3">
                        {current.options ? (
                            current.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`w-full py-4 px-6 rounded-xl text-left font-medium transition-all duration-200 ${formData[current.key as keyof typeof formData] === option
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))
                        ) : (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder={current.placeholder || ''}
                                    value={formData[current.key as keyof typeof formData]}
                                    onChange={(e) => handleInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && formData[current.key as keyof typeof formData] && handleNext()}
                                    className="w-full px-6 py-4 rounded-xl bg-gray-100 text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                                    autoFocus
                                />
                                <button
                                    onClick={handleNext}
                                    disabled={!formData[current.key as keyof typeof formData]}
                                    className="w-full py-4 px-6 rounded-xl bg-purple-600 text-white font-semibold text-lg shadow-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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