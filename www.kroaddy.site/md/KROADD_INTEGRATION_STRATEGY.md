# kroadd/src → Next.js 통합 전략

## 📋 개요

`kroadd/src` 디렉토리에 있는 Vite 기반 React 앱을 Next.js 구조(`frontend/app`, `components`, `lib`, `store` 등)로 통합하는 전략입니다.

## 🔍 현재 구조 분석

### kroadd/src 구조
```
kroadd/src/
├── App.tsx                    # 메인 앱 컴포넌트 (Vite 진입점)
├── main.tsx                   # Vite 진입점 (createRoot)
├── index.css                  # Tailwind CSS v4 (컴파일된 CSS)
├── styles/
│   └── globals.css            # Tailwind CSS v4 설정
├── components/
│   ├── Chatbot.tsx            # 챗봇 컴포넌트
│   ├── MapView.tsx            # 지도 뷰 컴포넌트
│   ├── Sidebar.tsx            # 사이드바 컴포넌트
│   ├── PlacePopup.tsx         # 장소 팝업 컴포넌트
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/                    # shadcn/ui 컴포넌트들 (50+ 파일)
├── guidelines/
│   └── Guidelines.md
└── Attributions.md
```

### Next.js 구조 (현재)
```
frontend/
├── app/
│   ├── page.tsx               # 현재 챗봇 페이지 (Zustand 사용)
│   ├── layout.tsx
│   └── globals.css            # Tailwind CSS v3
├── lib/
│   ├── api.ts
│   └── store/                 # Zustand 슬라이스 패턴
├── components/                # 없음 (생성 필요)
└── package.json               # Next.js 14.2.5, Tailwind v3
```

## 🎯 통합 목표

1. **컴포넌트 통합**: kroadd의 모든 컴포넌트를 Next.js 구조로 이동
2. **스타일 통합**: Tailwind CSS v4 → v3 호환성 확보
3. **의존성 통합**: 필요한 패키지들을 Next.js 프로젝트에 추가
4. **타입 통합**: 공통 타입 정의 통합
5. **기능 통합**: App.tsx 로직을 Next.js 페이지/레이아웃으로 변환

## 📦 1단계: 의존성 통합

### 1.1 package.json 의존성 추가

**kroadd/package.json에서 필요한 패키지:**
```json
{
  "@radix-ui/*": "^1.x.x",        // shadcn/ui 컴포넌트들
  "lucide-react": "^0.487.0",     // 아이콘
  "class-variance-authority": "^0.7.1",
  "clsx": "*",
  "tailwind-merge": "*",
  "next-themes": "^0.4.6",        // 다크모드
  "react-hook-form": "^7.55.0",
  "recharts": "^2.15.2",          // 차트 (필요시)
  "sonner": "^2.0.3",             // 토스트
  "vaul": "^1.1.2"                // Drawer
}
```

**추가할 패키지 (지도 관련):**
- `@react-google-maps/api` (이미 있음)
- Google Maps API 키 설정 필요

### 1.2 실행 계획
1. `frontend/package.json`에 위 패키지들 추가
2. `npm install` 실행
3. 버전 충돌 확인 및 해결

## 🗂️ 2단계: 디렉토리 구조 생성

### 2.1 components 디렉토리 생성
```
frontend/
└── components/
    ├── kroaddy/              # kroadd 앱 전용 컴포넌트
    │   ├── Chatbot.tsx
    │   ├── MapView.tsx
    │   ├── Sidebar.tsx
    │   ├── PlacePopup.tsx
    │   └── figma/
    │       └── ImageWithFallback.tsx
    └── ui/                   # shadcn/ui 컴포넌트들
        ├── accordion.tsx
        ├── alert-dialog.tsx
        ├── ... (50+ 파일)
        └── utils.ts
```

### 2.2 실행 계획
1. `frontend/components` 디렉토리 생성
2. `frontend/components/kroaddy` 디렉토리 생성
3. `frontend/components/ui` 디렉토리 생성

## 📝 3단계: 파일 이동 및 수정

### 3.1 컴포넌트 파일 이동

**이동할 파일들:**
```
kroadd/src/components/Chatbot.tsx
  → frontend/components/kroaddy/Chatbot.tsx

kroadd/src/components/MapView.tsx
  → frontend/components/kroaddy/MapView.tsx

kroadd/src/components/Sidebar.tsx
  → frontend/components/kroaddy/Sidebar.tsx

kroadd/src/components/PlacePopup.tsx
  → frontend/components/kroaddy/PlacePopup.tsx

kroadd/src/components/figma/ImageWithFallback.tsx
  → frontend/components/kroaddy/figma/ImageWithFallback.tsx

kroadd/src/components/ui/* (모든 파일)
  → frontend/components/ui/*
```

### 3.2 import 경로 수정 필요 사항

**수정이 필요한 import:**
- `'../App'` → 타입 정의를 별도 파일로 분리
- 상대 경로 → 절대 경로 (`@/components/...`)
- `'lucide-react'` → 그대로 유지 (의존성 추가됨)

### 3.3 타입 정의 분리

**App.tsx에서 추출할 타입:**
```typescript
// frontend/lib/types/kroaddy.ts (새로 생성)
export type Screen = 'initial' | 'chatResponse' | 'placeDetail';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Location {
  name: string;
  lat: number;
  lng: number;
}
```

**수정할 컴포넌트:**
- `Chatbot.tsx`: `import { Message } from '../App'` → `import { Message } from '@/lib/types/kroaddy'`
- `MapView.tsx`: `import { Location } from '../App'` → `import { Location } from '@/lib/types/kroaddy'`
- `PlacePopup.tsx`: `import { Location } from '../App'` → `import { Location } from '@/lib/types/kroaddy'`

## 🎨 4단계: 스타일 통합

### 4.1 Tailwind CSS 버전 차이

**문제점:**
- `kroadd`: Tailwind CSS v4 (컴파일된 CSS)
- `Next.js`: Tailwind CSS v3 (설정 파일 기반)

**해결 방안:**
1. **옵션 A (권장)**: Tailwind v3로 통일
   - `kroadd/src/index.css`의 유틸리티 클래스는 v3에서도 작동
   - `kroadd/src/styles/globals.css`의 CSS 변수들을 `app/globals.css`에 통합
   - `tailwind.config.ts`에 필요한 설정 추가

2. **옵션 B**: Tailwind v4로 업그레이드
   - Next.js 프로젝트를 Tailwind v4로 업그레이드
   - 더 복잡하지만 최신 기능 사용 가능

### 4.2 CSS 변수 통합

**kroadd/src/styles/globals.css의 CSS 변수:**
- `:root` 변수들 (색상, 폰트, 간격 등)
- `.dark` 클래스 변수들
- `@theme inline` 블록

**통합 방법:**
1. `app/globals.css`에 필요한 CSS 변수 추가
2. 기존 Next.js 스타일과 충돌 확인
3. 충돌 시 우선순위 결정 (kroaddy 스타일 우선 또는 병합)

### 4.3 실행 계획
1. `kroadd/src/styles/globals.css` 내용 검토
2. `app/globals.css`에 필요한 변수 추가
3. `tailwind.config.ts`에 커스텀 색상/테마 추가
4. 스타일 충돌 테스트

## 🔧 5단계: App.tsx 로직 통합

### 5.1 App.tsx 분석

**주요 기능:**
- 화면 상태 관리 (`Screen` 타입)
- 메시지 상태 관리 (`Message[]`)
- 선택된 장소 관리 (`Location | null`)
- 경로 관리 (`Location[]`)
- 이벤트 핸들러들

### 5.2 통합 옵션

**옵션 A: 새로운 페이지로 생성**
```
frontend/app/kroaddy/page.tsx  (새 페이지)
```
- 기존 `app/page.tsx`는 유지
- `/kroaddy` 경로로 접근

**옵션 B: 기존 페이지 교체**
```
frontend/app/page.tsx  (기존 페이지 교체)
```
- 기존 챗봇 페이지를 kroaddy 앱으로 교체

**옵션 C: Zustand store 통합**
- App.tsx의 상태를 Zustand store로 이동
- 기존 `messageSlice`와 통합 또는 새 슬라이스 생성

### 5.3 권장 방법: 옵션 A + Zustand 통합

1. **새 슬라이스 생성**: `frontend/lib/store/slices/kroaddySlice.ts`
   ```typescript
   export interface KroaddySlice {
     screen: Screen;
     selectedPlace: Location | null;
     route: Location[];
     setScreen: (screen: Screen) => void;
     setSelectedPlace: (place: Location | null) => void;
     setRoute: (route: Location[]) => void;
     handleSendMessage: (message: string) => void;
     handlePlaceClick: (place: Location) => void;
     handleClosePopup: () => void;
   }
   ```

2. **새 페이지 생성**: `frontend/app/kroaddy/page.tsx`
   ```typescript
   'use client';
   import { Sidebar } from '@/components/kroaddy/Sidebar';
   import { Chatbot } from '@/components/kroaddy/Chatbot';
   import { MapView } from '@/components/kroaddy/MapView';
   import { PlacePopup } from '@/components/kroaddy/PlacePopup';
   import { useKroaddy } from '@/lib/store';
   
   export default function KroaddyPage() {
     const { screen, selectedPlace, route, ... } = useKroaddy();
     // App.tsx 로직 구현
   }
   ```

### 5.4 실행 계획
1. `kroaddySlice.ts` 생성
2. `app/kroaddy/page.tsx` 생성
3. App.tsx 로직을 페이지 컴포넌트로 변환
4. 상태 관리를 Zustand로 이동

## 📚 6단계: 문서 및 설정 파일

### 6.1 이동할 문서
```
kroadd/src/Attributions.md
  → frontend/docs/Attributions.md (또는 삭제)

kroadd/src/guidelines/Guidelines.md
  → frontend/docs/Guidelines.md
```

### 6.2 불필요한 파일
```
kroadd/src/main.tsx          # Vite 진입점 (불필요)
kroadd/src/index.css         # 컴파일된 CSS (불필요)
kroadd/index.html            # Vite HTML (불필요)
kroadd/vite.config.ts        # Vite 설정 (불필요)
kroadd/package.json          # 별도 패키지 (불필요)
```

## ✅ 7단계: 검증 및 테스트

### 7.1 체크리스트

**컴포넌트 통합:**
- [ ] 모든 컴포넌트 파일 이동 완료
- [ ] import 경로 수정 완료
- [ ] 타입 정의 분리 완료
- [ ] 컴포넌트별 타입 에러 없음

**스타일 통합:**
- [ ] CSS 변수 통합 완료
- [ ] Tailwind 클래스 정상 작동
- [ ] 다크모드 지원 확인
- [ ] 반응형 디자인 확인

**기능 통합:**
- [ ] 페이지 라우팅 정상 작동
- [ ] 상태 관리 정상 작동
- [ ] 이벤트 핸들러 정상 작동
- [ ] API 연동 정상 작동 (필요시)

**의존성:**
- [ ] 모든 패키지 설치 완료
- [ ] 버전 충돌 없음
- [ ] 빌드 성공

### 7.2 테스트 시나리오

1. **기본 렌더링**: 페이지 접속 시 모든 컴포넌트 정상 표시
2. **챗봇 기능**: 메시지 전송 및 응답 확인
3. **지도 기능**: 지도 표시 및 인터랙션 확인
4. **장소 선택**: 장소 클릭 시 팝업 표시 확인
5. **라우팅**: 화면 전환 정상 작동 확인

## 🚨 주의사항

### 1. Google Maps API
- `MapView.tsx`는 Google Maps를 사용
- API 키 설정 필요 (`next.config.mjs` 또는 환경 변수)
- `@react-google-maps/api` 패키지 확인

### 2. 이미지 최적화
- `ImageWithFallback.tsx`의 이미지 URL 확인
- Next.js Image 컴포넌트로 교체 고려

### 3. 클라이언트 컴포넌트
- 모든 kroaddy 컴포넌트는 `'use client'` 필요
- 지도, 인터랙션 등 클라이언트 사이드 기능 사용

### 4. 타입 안전성
- 모든 타입 정의 확인
- `any` 타입 최소화
- TypeScript 에러 없음 확인

## 📋 실행 순서 요약

1. **의존성 추가**: `package.json` 업데이트 및 설치
2. **디렉토리 생성**: `components/kroaddy`, `components/ui` 생성
3. **타입 정의**: `lib/types/kroaddy.ts` 생성
4. **컴포넌트 이동**: 모든 컴포넌트 파일 이동
5. **import 수정**: 경로 및 타입 import 수정
6. **스타일 통합**: CSS 변수 및 Tailwind 설정 통합
7. **Store 통합**: `kroaddySlice.ts` 생성 및 통합
8. **페이지 생성**: `app/kroaddy/page.tsx` 생성
9. **검증**: 빌드 및 런타임 테스트
10. **정리**: 불필요한 파일 삭제

## 🎯 최종 구조

```
frontend/
├── app/
│   ├── page.tsx              # 기존 챗봇 페이지
│   ├── kroaddy/
│   │   └── page.tsx          # 새 kroaddy 페이지
│   ├── layout.tsx
│   └── globals.css           # 통합된 스타일
├── components/
│   ├── kroaddy/              # kroaddy 전용 컴포넌트
│   └── ui/                   # shadcn/ui 컴포넌트
├── lib/
│   ├── api.ts
│   ├── types/
│   │   └── kroaddy.ts        # kroaddy 타입 정의
│   └── store/
│       ├── slices/
│       │   ├── kroaddySlice.ts  # 새 슬라이스
│       │   └── ...
│       └── index.ts
└── package.json              # 통합된 의존성
```

## 📝 다음 단계

이 전략 문서를 바탕으로 실제 통합 작업을 진행합니다. 각 단계별로 코드 수정 없이 구조만 확인한 후, 사용자 승인을 받고 진행하는 것을 권장합니다.

