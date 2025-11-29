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
        <div className="flex h-screen bg-gray-50">
            {/* 왼쪽 사이드바 */}
            <div className="w-64 bg-black flex flex-col">
                {/* 로고 */}
                <div className="p-6">
                    <div className="bg-white rounded-lg px-4 py-2 inline-block">
                        <span className="text-2xl font-bold text-black">Kroaddy</span>
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
                                className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-white/80 hover:bg-gray-800/50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* 로그아웃 */}
                <div className="p-4 border-t border-gray-700">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-gray-800/50 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">로그아웃</span>
                        <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                </div>
            </div>

            {/* 중앙 메인 콘텐츠 */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">댓글 단 글</h1>

                    {/* 댓글 목록 */}
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-sm text-gray-500">{comment.timestamp}</span>
                                </div>

                                <p className="text-gray-800 mb-4">{comment.content}</p>

                                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-gray-900">{comment.place}</span>
                                        <span className="text-sm text-gray-600">{comment.postId}</span>
                                        <span className="text-sm text-gray-600">{comment.ageRange}</span>
                                    </div>
                                    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                                        확인
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 오른쪽 사이드바 */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
                {/* 사용자 프로필 */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">asd · 40대</h2>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        인증 미완료
                    </span>
                </div>

                {/* 계정 섹션 */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">계정</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push('/mypage/profile')}
                            className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Settings className="w-5 h-5 text-gray-400" />
                                <span>내 정보 관리</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                <span>인증</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* 글 관리 섹션 */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">글 관리</h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <span>내가 쓴 글</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-900 rounded-lg">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-black" />
                                <span className="font-medium">댓글 단 글</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-black" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
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

