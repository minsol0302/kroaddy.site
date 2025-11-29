# 환경 변수 설정 가이드

## .env.local 파일 생성

`my-login-app/` 폴더 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# ============================================
# Next.js 프론트엔드 환경 변수
# 카카오 키는 Gateway에만 저장됩니다.
# ============================================

# 백엔드 Gateway 주소
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080

# 로그인 버튼이 이동할 Gateway 로그인 엔드포인트
# fetch 방식 또는 직접 리다이렉트 방식 모두 지원
NEXT_PUBLIC_KAKAO_LOGIN_URL=http://localhost:8080/kakao/login

# Gateway가 로그인 성공 시 되돌아올 프론트 콜백 URL
NEXT_PUBLIC_LOGIN_CALLBACK_URL=http://localhost:3000/auth/kakao

# 프론트엔드 기본 URL
NEXT_PUBLIC_FRONT_URL=http://localhost:3000
```

## 중요 사항

⚠️ **카카오 키는 이 파일에 넣지 않습니다!**
- 카카오 REST API Key
- 카카오 Client Secret
- 카카오 Admin Key

이 모든 키는 **Gateway의 .env 파일**에만 저장됩니다.

## Gateway 환경 변수 (참고)

Gateway 쪽에는 다음과 같은 환경 변수가 필요합니다:

```env
# Gateway .env
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:8080/oauth2/kakao/callback
FRONT_LOGIN_CALLBACK_URL=http://localhost:3000/auth/kakao
JWT_SECRET=your_jwt_secret
```

## 포트 변경 시

만약 Next.js가 다른 포트(예: 3003)에서 실행 중이라면:

```env
NEXT_PUBLIC_FRONT_URL=http://localhost:3003
NEXT_PUBLIC_LOGIN_CALLBACK_URL=http://localhost:3003/auth/kakao
```

Gateway의 `FRONT_LOGIN_CALLBACK_URL`도 동일하게 변경해야 합니다.

