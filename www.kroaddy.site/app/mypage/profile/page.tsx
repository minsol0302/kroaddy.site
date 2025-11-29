'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Edit2 } from 'lucide-react';
import Image from 'next/image';

interface OnboardingData {
    gender: string;
    age: string;
    nationality: string;
    religion: string;
    dietary: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
    const [completedAt, setCompletedAt] = useState<string | null>(null);

    useEffect(() => {
        // 로컬 스토리지에서 온보딩 데이터 불러오기
        if (typeof window !== 'undefined') {
            const savedData = localStorage.getItem('onboardingData');
            const savedDate = localStorage.getItem('onboardingCompletedAt');

            if (savedData) {
                try {
                    setOnboardingData(JSON.parse(savedData));
                } catch (error) {
                    console.error('Failed to parse onboarding data:', error);
                }
            }

            if (savedDate) {
                setCompletedAt(savedDate);
            }
        }
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const infoItems = [
        { label: '성별', key: 'gender', value: onboardingData?.gender || '미입력' },
        { label: '나이', key: 'age', value: onboardingData?.age || '미입력' },
        { label: '국적', key: 'nationality', value: onboardingData?.nationality || '미입력' },
        { label: '종교', key: 'religion', value: onboardingData?.religion || '미입력' },
        { label: '식습관', key: 'dietary', value: onboardingData?.dietary || '미입력' },
    ];

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage: 'url(/paper2.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>뒤로 가기</span>
                    </button>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* 프로필 헤더 */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-12 h-12 text-gray-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">내 정보 관리</h1>
                                    {completedAt && (
                                        <p className="text-sm text-gray-500">
                                            정보 입력일: {formatDate(completedAt)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                <span>수정</span>
                            </button>
                        </div>

                        {/* 정보 카드 */}
                        <div className="space-y-4">
                            {infoItems.map((item) => (
                                <div
                                    key={item.key}
                                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {item.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 데이터가 없을 때 */}
                        {!onboardingData && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">아직 입력된 정보가 없습니다.</p>
                                <button
                                    onClick={() => router.push('/onboarding')}
                                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    정보 입력하러 가기
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 백엔드 연동 안내 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">백엔드 연동 안내</h3>
                    <p className="text-sm text-blue-800 mb-4">
                        현재는 프론트엔드에서만 데이터를 관리하고 있습니다. 백엔드와 연동하려면 다음 작업이 필요합니다:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-2 list-disc list-inside">
                        <li>온보딩 완료 시: POST /api/user/profile - 사용자 정보 저장</li>
                        <li>프로필 조회 시: GET /api/user/profile - 사용자 정보 조회</li>
                        <li>프로필 수정 시: PUT /api/user/profile - 사용자 정보 업데이트</li>
                        <li>인증 토큰을 헤더에 포함하여 요청</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

