'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative overflow-hidden hide-scrollbar">
      {/* 배경 애니메이션 요소들 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-circle floating-circle-1"></div>
        <div className="floating-circle floating-circle-2"></div>
        <div className="floating-circle floating-circle-3"></div>
      </div>

      {/* 로고 */}
      <div className="mb-20 opacity-0 animate-fade-in-up relative z-10">
        <div className="relative logo-container">
          <div className="absolute inset-0 animate-pulse-slow blur-3xl opacity-20 bg-gradient-to-r from-red-400 via-blue-400 to-red-400"></div>
          <Image
            src="/logo3.png"
            alt="Kroaddy"
            width={400}
            height={400}
            priority
            className="w-64 md:w-72 lg:w-80 relative animate-float logo-shadow"
          />
        </div>
      </div>

      {/* 타이틀 */}
      <div className="mb-12 opacity-0 animate-fade-in-up animation-delay-200 relative z-10">
        <div className="title-wrapper relative inline-block animate-float-subtle">
          <h1
            className="antialiased relative cursor-default transition-all duration-500"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(3.5rem, 10vw, 6rem)',
              color: '#0a0a0a',
              letterSpacing: '-0.03em',
              lineHeight: '1.2'
            }}
          >
            <span className="inline-block">
              {/* K */}
              <span
                className="inline-block transition-all duration-500"
                style={{ color: isHovered ? '#dc2626' : '#0a0a0a' }}
              >
                K
              </span>

              {/* 점 1 */}
              <span
                className="inline-block transition-all duration-400"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'scale(1)' : 'scale(0)',
                  width: isHovered ? 'auto' : '0',
                  margin: isHovered ? '0 0.3em' : '0',
                  color: '#9ca3af'
                }}
              >
                •
              </span>

              {/* r */}
              <span
                className="inline-block transition-all duration-500"
                style={{ color: isHovered ? '#dc2626' : '#0a0a0a' }}
              >
                r
              </span>

              {/* o */}
              <span
                className="inline-block transition-all duration-500"
                style={{ color: isHovered ? '#2563eb' : '#0a0a0a' }}
              >
                o
              </span>

              {/* a */}
              <span
                className="inline-block transition-all duration-500"
                style={{ color: isHovered ? '#2563eb' : '#0a0a0a' }}
              >
                a
              </span>

              {/* d */}
              <span
                className="inline-block transition-all duration-500"
                style={{ color: isHovered ? '#dc2626' : '#0a0a0a' }}
              >
                d
              </span>

              {/* 점 2 */}
              <span
                className="inline-block transition-all duration-400"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? 'scale(1)' : 'scale(0)',
                  width: isHovered ? 'auto' : '0',
                  margin: isHovered ? '0 0.3em' : '0',
                  color: '#9ca3af'
                }}
              >
                •
              </span>

              {/* d->b 변환 (6번째 글자, 좌우반전) */}
              <span
                className="inline-block transition-all duration-700"
                style={{
                  color: isHovered ? '#2563eb' : '#0a0a0a',
                  display: 'inline-block'
                }}
              >
                {isHovered ? 'b' : 'd'}
              </span>

              {/* y */}
              <span
                className="inline-block transition-all duration-500"
                style={{ color: isHovered ? '#dc2626' : '#0a0a0a' }}
              >
                y
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* 시작하기 링크 */}
      <div className="mt-32 animate-fade-in-up animation-delay-400 relative z-10 animate-float-link">
        <Link
          href="/login"
          className="text-link group inline-flex items-center gap-3 transition-all duration-500"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="link-text font-semibold text-xl">지금 시작하기</span>
          <span className="link-arrow text-2xl">→</span>
        </Link>
      </div>
    </main>
  );
}