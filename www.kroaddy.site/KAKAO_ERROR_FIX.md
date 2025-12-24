# 카카오 로그인 오류 해결 가이드 (KOE101)

## 오류 내용
- **오류 코드**: KOE101
- **오류 메시지**: 앱 관리자 설정 오류
- **원인**: 카카오 개발자 콘솔에서 앱 설정이 올바르지 않음

## 해결 방법

### 1. 카카오 개발자 콘솔 접속
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 선택

### 2. 플랫폼 설정 확인
**앱 설정 → 플랫폼**에서:
- ✅ **Web 플랫폼 등록** 확인
  - 사이트 도메인: `http://localhost:3000` (개발 환경)
  - 사이트 도메인: `https://yourdomain.com` (프로덕션)

### 3. Redirect URI 등록 (가장 중요!)
**제품 설정 → 카카오 로그인 → Redirect URI 등록**에서:

#### Gateway 콜백 URI (필수)
```
http://localhost:8080/kakao/callback
```
또는 Gateway가 실제로 사용하는 콜백 경로:
```
http://localhost:8080/oauth2/kakao/callback
```

#### Next.js 콜백 URI (선택)
```
http://localhost:3000/auth/kakao
```

**⚠️ 중요**: Gateway가 카카오와 직접 통신하므로, **Gateway의 콜백 URI만 등록하면 됩니다.**

### 4. 카카오 로그인 활성화
**제품 설정 → 카카오 로그인**에서:
- ✅ **활성화 설정** → **ON**
- ✅ **Redirect URI** 등록 확인

### 5. 동의 항목 설정
**제품 설정 → 카카오 로그인 → 동의항목**에서:
- ✅ **닉네임** (필수)
- ✅ **프로필 사진** (선택)
- ✅ **카카오계정(이메일)** (선택)

### 6. 앱 키 확인
**앱 설정 → 앱 키**에서:
- ✅ **REST API 키** 확인 (Gateway에서 사용)
- ✅ **Client Secret** 활성화 (보안 강화)

## 현재 설정 확인

### Gateway에서 사용하는 콜백 URI 확인
Gateway 코드에서 다음 경로를 확인하세요:
- `/kakao/callback`
- `/oauth2/kakao/callback`
- `/login/oauth2/code/kakao`

이 경로를 카카오 개발자 콘솔에 **정확히** 등록해야 합니다.

## 체크리스트

- [ ] Web 플랫폼 등록됨
- [ ] 카카오 로그인 활성화됨
- [ ] Redirect URI가 Gateway 콜백 경로와 정확히 일치
- [ ] 동의 항목 설정 완료
- [ ] REST API 키 확인
- [ ] Client Secret 활성화 (선택이지만 권장)

## 주의사항

1. **Redirect URI는 정확히 일치해야 함**
   - `http://localhost:8080/kakao/callback` ≠ `http://localhost:8080/kakao/callback/`
   - 마지막 슬래시(/)도 정확히 일치해야 함

2. **포트 번호 확인**
   - Gateway 포트: `8080`
   - Next.js 포트: `3000`

3. **프로토콜 확인**
   - 개발: `http://`
   - 프로덕션: `https://`

## Gateway 콜백 URI 확인 방법

Gateway 코드에서 다음을 확인하세요:
```java
// Spring Security 설정
redirect-uri: "{baseUrl}/kakao/callback"
// 또는
redirect-uri: "{baseUrl}/oauth2/kakao/callback"
```

이 경로를 카카오 개발자 콘솔에 등록하세요.

