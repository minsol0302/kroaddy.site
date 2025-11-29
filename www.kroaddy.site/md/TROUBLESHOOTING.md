# 오류 해결 가이드

## 현재 상황
- `/login` 페이지에서 오류 발생
- `/auth/kakao/callback` 페이지에서 오류 발생

## 확인 사항

### 1. 브라우저 콘솔 오류 확인
브라우저 개발자 도구(F12)를 열고 Console 탭에서 오류 메시지를 확인하세요.

### 2. 개발 서버 터미널 오류 확인
Next.js 개발 서버를 실행한 터미널에서 빨간색 오류 메시지가 있는지 확인하세요.

### 3. 파일 확인
다음 파일들이 올바른 위치에 있는지 확인:
- ✅ `src/app/login/page.tsx`
- ✅ `src/app/auth/kakao/callback/page.tsx`
- ✅ `src/components/KakaoLoginButton.tsx`

## 일반적인 오류 해결

### 오류: "Module not found"
```bash
# node_modules 재설치
rm -rf node_modules
npm install
```

### 오류: "Cannot find module '@/components/KakaoLoginButton'"
`tsconfig.json`의 paths 설정 확인:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 오류: "useSearchParams should be wrapped in a suspense boundary"
이미 수정되었습니다. `Suspense`로 감싸져 있습니다.

## 다음 단계

1. **브라우저 콘솔 오류 메시지 복사**
2. **개발 서버 터미널 오류 메시지 복사**
3. **오류 메시지를 알려주시면 정확한 해결책을 제시하겠습니다**

## 빠른 테스트

터미널에서:
```bash
# 캐시 삭제
Remove-Item -Recurse -Force .next

# 개발 서버 재시작
npm run dev
```

브라우저에서:
- `http://localhost:3000/login` 접속
- F12로 개발자 도구 열기
- Console 탭에서 오류 확인

