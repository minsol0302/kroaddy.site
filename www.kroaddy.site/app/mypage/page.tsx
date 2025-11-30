'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Home, MessageSquare, MapPin, User, LogOut, Settings, FileText, Heart, ChevronRight } from 'lucide-react';

export default function MyPage() {
    const router = useRouter();
    const [activeMenu, setActiveMenu] = useState('mypage');

    // 댓글 단 글 목록 (예시 데이터)
    const comments = [
        {
            id: 1,
            timestamp: '08/10 03:23',
            content: 'Lorem Ipsum',
            place: 'Gyeongbokgung Palace',
            postId: 'Post 230',
            ageRange: '29 - 40s'
        },
        {
            id: 2,
            timestamp: '08/09 14:15',
            content: 'Lorem Ipsum',
            place: 'Namsan Tower',
            postId: 'Post 189',
            ageRange: '29 - 40s'
        },
        {
            id: 3,
            timestamp: '08/08 09:42',
            content: 'Lorem Ipsum',
            place: 'Myeongdong',
            postId: 'Post 156',
            ageRange: '29 - 40s'
        }
    ];

    const menuItems = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'reviews', label: '여행후기', icon: MessageSquare },
        { id: 'status', label: '여행현황', icon: MapPin },
        { id: 'mypage', label: '마이페이지', icon: User }
    ];

    return (
        <div className="flex h-screen relative overflow-hidden">
            {/* 배경 애니메이션 요소들 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="floating-circle floating-circle-1"></div>
                <div className="floating-circle floating-circle-2"></div>
                <div className="floating-circle floating-circle-3"></div>
            </div>

            {/* 왼쪽 사이드바 */}
            <div className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 flex flex-col relative z-10 shadow-lg">
                {/* 로고 */}
                <div className="p-6">
                    <div className="bg-gradient-to-r from-red-50 to-blue-50 rounded-lg px-4 py-2 inline-block border border-gray-200/50 shadow-sm">
                        <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-clip-text text-transparent">Kroaddy</span>
                    </div>
                </div>

                {/* 네비게이션 메뉴 */}
                <nav className="flex-1 px-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeMenu === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveMenu(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-300 ${isActive
                                    ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* 로그아웃 */}
                <div className="p-4 border-t border-gray-200/50">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-300">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">로그아웃</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                </div>
            </div>

            {/* 중앙 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto relative z-10">
                <div className="max-w-4xl mx-auto p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 opacity-0 animate-fade-in-up">댓글 단 글</h1>

                    {/* 댓글 목록 */}
                    <div className="space-y-4">
                        {comments.map((comment, index) => (
                            <div
                                key={comment.id}
                                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 border border-gray-200/50 opacity-0 animate-fade-in-up"
                                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-sm text-gray-500">{comment.timestamp}</span>
                                </div>

                                <p className="text-gray-800 mb-4">{comment.content}</p>

                                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-lg p-4 flex items-center justify-between border border-gray-200/50">
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-gray-900">{comment.place}</span>
                                        <span className="text-sm text-gray-600">{comment.postId}</span>
                                        <span className="text-sm text-gray-600">{comment.ageRange}</span>
                                    </div>
                                    <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-blue-500 text-white rounded-lg hover:from-red-600 hover:to-blue-600 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md">
                                        확인
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 오른쪽 사이드바 */}
            <div className="w-80 bg-white/80 backdrop-blur-md border-l border-gray-200/50 p-6 relative z-10 shadow-lg">
                {/* 사용자 프로필 */}
                <div className="text-center mb-8 opacity-0 animate-fade-in-up animation-delay-200">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-gray-200/50 shadow-sm">
                        <User className="w-10 h-10 text-gray-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">asd · 40대</h2>
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200/50">
                        인증 미완료
                    </span>
                </div>

                {/* 계정 섹션 */}
                <div className="mb-8 opacity-0 animate-fade-in-up animation-delay-300">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">계정</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push('/mypage/profile')}
                            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200/50"
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-gray-400" />
                                <span>내 정보 관리</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <span>인증</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* 글 관리 섹션 */}
                <div className="opacity-0 animate-fade-in-up animation-delay-400">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">글 관리</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span>내가 쓴 글</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-50 to-blue-50 text-gray-900 rounded-lg border border-gray-200/50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-gray-700" />
                                <span className="font-medium">댓글 단 글</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition-all duration-300 border border-transparent hover:border-gray-200/50">
                            <div className="flex items-center gap-3">
                                <Heart className="w-5 h-5 text-gray-400" />
                                <span>좋아요 표시한 글</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

