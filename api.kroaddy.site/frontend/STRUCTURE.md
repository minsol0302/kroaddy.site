# Frontend 프렉탈 구조 가이드

## 현재 구조 (soccer 서비스와 유사한 프렉탈 구조)

```
frontend/
├── src/
│   └── app/              # Next.js App Router (src/main/app 역할)
│       ├── api/          # API Routes
│       ├── components/    # React 컴포넌트
│       ├── hooks/        # Custom Hooks
│       ├── lib/          # 라이브러리 및 유틸리티
│       ├── providers/    # Context Providers
│       ├── store/        # Zustand Store
│       ├── types/        # TypeScript 타입 정의
│       ├── layout.tsx    # Root Layout
│       └── page.tsx      # Home Page
├── public/               # 정적 파일 (Next.js 요구사항으로 루트에 유지)
├── package.json          # 의존성 관리
├── tsconfig.json         # TypeScript 설정
├── next.config.mjs       # Next.js 설정
├── tailwind.config.ts    # Tailwind CSS 설정
├── postcss.config.mjs    # PostCSS 설정
└── Dockerfile            # Docker 빌드 설정
```

## Soccer 서비스 구조와의 비교

### Soccer 서비스:
```
service/soccer/
├── src/
│   ├── main/
│   │   ├── java/         # Java 소스 코드
│   │   └── resources/    # 리소스 파일
│   └── test/
│       └── java/         # 테스트 코드
├── build.gradle          # 빌드 설정
└── Dockerfile            # Docker 설정
```

### Frontend (Next.js 제약으로 인한 구조):
```
frontend/
├── src/
│   └── app/              # Next.js는 src/app만 지원 (src/main/app 대신)
│       └── ...           # 모든 앱 코드
├── public/               # Next.js 요구사항으로 루트에 유지
└── ...                   # 설정 파일들 (루트에 유지)
```

## 파일 이동 가이드

현재 `app/` 폴더를 `src/app/`로 이동해야 합니다:

1. `app/` → `src/app/` 이동
2. `public/`은 루트에 유지 (Next.js 요구사항)
3. 설정 파일들은 루트에 유지

## 주의사항

- Next.js는 `src/app/` 또는 `app/`만 지원합니다
- `src/main/app/`은 직접 지원하지 않으므로, `src/app/`을 사용합니다
- `public/` 폴더는 반드시 루트에 있어야 합니다
- `next.config.mjs`, `package.json` 등은 루트에 있어야 합니다

