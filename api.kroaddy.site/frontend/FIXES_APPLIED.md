# localhost:3000 연결 문제 수정 사항

## 수정된 파일들

### 1. `src/providers/QueryProvider.tsx`
- **문제**: React import 누락으로 `React.ReactNode` 타입 사용 불가
- **수정**: `import React, { useState } from 'react';` 추가

### 2. `tailwind.config.ts`
- **문제**: content 경로가 `./app/**/*`로 되어 있어 `src/app/**/*`를 인식하지 못함
- **수정**: 모든 경로를 `./src/`로 시작하도록 변경
  - `./src/pages/**/*.{js,ts,jsx,tsx,mdx}`
  - `./src/components/**/*.{js,ts,jsx,tsx,mdx}`
  - `./src/app/**/*.{js,ts,jsx,tsx,mdx}`

### 3. `.next` 캐시 삭제
- 빌드 캐시를 삭제하여 새로운 설정이 적용되도록 함

## 다음 단계

1. 개발 서버 재시작:
   ```powershell
   cd frontend
   pnpm dev
   ```

2. 브라우저에서 `http://localhost:3000` 접속

3. 문제가 계속되면:
   - `pnpm install` 재실행
   - `rm -rf .next node_modules` 후 재설치

