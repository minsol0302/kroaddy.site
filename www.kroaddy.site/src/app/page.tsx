import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-8 py-20 text-center">
            {/* 로고 */}
            <div className="mb-12 opacity-0 animate-fade-in-up">
                <Image
                    src="/kroaddy-logo.png"
                    alt="Kroaddy"
                    width={400}
                    height={400}
                    priority
                    className="w-80 md:w-96 lg:w-[28rem]"
                />
            </div>

            {/* 타이틀 */}
            <h1
                className="mb-8 opacity-0 animate-fade-in-up animation-delay-200 antialiased"
                style={{
                    fontWeight: 700,
                    fontSize: '32px',
                    color: '#111',
                    letterSpacing: '0.3px'
                }}
            >
                Kroaddy
            </h1>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up animation-delay-600">
                <Link
                    href="/home"
                    className="px-7 py-3 bg-blue-600 text-white text-base font-semibold rounded-xl hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                    지금 시작하기
                </Link>
            </div>
        </main>
    );
}