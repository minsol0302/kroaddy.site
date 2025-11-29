# 환경 변수 설정 가이드

## 📋 카카오 OAuth2 로그인에 필요한 환경 변수

### ⚠️ 중요
- 이 파일은 예제입니다. 실제 키는 `.env.local`에 저장하세요.
- `.env.local`은 `.gitignore`에 추가되어 있어야 합니다.
- 절대 GitHub에 실제 키를 커밋하지 마세요.

---

## 🔑 Next.js 프론트엔드 환경 변수

`.env.local` 파일을 프로젝트 루트에 생성하세요:

```env
# ============================================
# 카카오 OAuth2 로그인 설정
# ============================================

# 카카오 REST API Key (필수)
# 카카오 개발자 콘솔 → 앱 설정 → 앱 키 → REST API 키
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key_here

# 카카오 Client Secret (선택이지만 강력 권장)
# ⚠️ 주의: NEXT_PUBLIC_ 접두사가 없으므로 서버 사이드에서만 사용 가능
# 프론트엔드에서는 사용하지 않습니다 (백엔드에서만 사용)
KAKAO_CLIENT_SECRET=your_kakao_client_secret_here

# 카카오 JavaScript Key (프론트에서 직접 SDK 사용 시에만 필요)
# 일반적으로 MSA 구조에서는 불필요
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key_here

# Redirect URI (Next.js)
# 카카오 개발자 콘솔에 등록해야 함
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback

# API Gateway URL
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8081
```

---

## ☕ 스프링 백엔드 환경 변수

### Gateway Service

`application.yml` 또는 환경 변수로 설정:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          kakao:
            client-id: ${KAKAO_CLIENT_ID}
            client-secret: ${KAKAO_CLIENT_SECRET}
            redirect-uri: "{baseUrl}/login/oauth2/code/kakao"
            authorization-grant-type: authorization_code
            scope:
              - profile_nickname
              - profile_image
              - account_email
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id
```

### 환경 변수 (프로덕션: Railway/AWS/K8s)

```bash
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

---

## 🔒 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 실제 키를 GitHub에 커밋하지 않았는지 확인
- [ ] 프로덕션 환경에서는 환경 변수로 키를 관리하는지 확인
- [ ] Client Secret은 백엔드에서만 사용하는지 확인
- [ ] `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저에 노출됨을 인지

---

## 📝 키 발급 위치

1. **REST API Key**: 카카오 개발자 콘솔 → 앱 설정 → 앱 키 → REST API 키
2. **Client Secret**: 카카오 개발자 콘솔 → 앱 설정 → 보안 → Client Secret 활성화
3. **JavaScript Key**: 카카오 개발자 콘솔 → 앱 설정 → 앱 키 → JavaScript 키

---

## 🚀 다음 단계

1. 카카오 개발자 콘솔에서 키 발급
2. `.env.local` 파일 생성 및 키 설정
3. 스프링 백엔드 환경 변수 설정
4. 테스트 실행

