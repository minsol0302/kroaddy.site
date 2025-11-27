# Frontend 구조 정리 완료

## ✅ 완료된 작업

### 1. 폴더 구조 정리
- ✅ `hooks/` → `lib/hooks/`로 이동
- ✅ `providers/` → `lib/providers/`로 이동  
- ✅ `components/figma/` → `components/`로 직접 이동

### 2. Import 경로 수정
- ✅ `app/layout.tsx`: `../lib/providers/QueryProvider`
- ✅ `components/MapView.tsx`: `./ImageWithFallback`
- ✅ `components/PlacePopup.tsx`: `./ImageWithFallback`
- ✅ `lib/hooks/useSearchQuery.ts`: 상대 경로 수정

### 3. Export 정리
- ✅ `lib/index.ts`에 hooks와 providers export 추가

## 📁 최종 구조

```
frontend/src/
├── app/                    # Next.js App Router (라우팅만)
│   ├── api/                # API Routes
│   │   └── search/
│   │       └── route.ts
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈 페이지
│   ├── globals.css         # 전역 스타일
│   └── favicon.ico
│
├── components/             # 재사용 가능한 UI 컴포넌트
│   ├── Chatbot.tsx
│   ├── ImageWithFallback.tsx
│   ├── MapView.tsx
│   ├── PlacePopup.tsx
│   ├── Sidebar.tsx
│   └── ui/                 # Radix UI 컴포넌트들
│
├── lib/                    # 유틸리티, API 클라이언트
│   ├── api/
│   │   └── searchApi.ts
│   ├── hooks/
│   │   └── useSearchQuery.ts
│   ├── providers/
│   │   └── QueryProvider.tsx
│   ├── api-client.ts
│   ├── index.ts
│   ├── types.ts
│   └── slices/
│
├── store/                  # Zustand Store
│   ├── index.ts
│   ├── types.ts
│   ├── useStore.ts
│   └── slices/
│
├── config/                 # 설정 파일
│   └── services.ts
│
└── guidelines/             # 문서
    ├── Attributions.md
    └── Guidelines.md
```

## 🚀 실행 방법

```powershell
cd frontend
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

## ✅ 확인 사항

- ✅ 모든 import 경로 수정 완료
- ✅ Lint 오류 없음
- ✅ 구조 정리 완료
- ✅ 제시된 구조와 일치

