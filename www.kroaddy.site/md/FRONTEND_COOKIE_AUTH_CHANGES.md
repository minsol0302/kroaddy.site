# 프론트엔드 쿠키 기반 인증 변경사항 가이드

## 📋 개요

프론트엔드가 **쿠키 기반 인증**으로 전환되었습니다. 이전에는 URL 쿼리 파라미터로 JWT 토큰을 전달받아 localStorage에 저장했지만, 이제는 **백엔드에서 설정한 HttpOnly 쿠키를 자동으로 사용**합니다.

## 🔄 변경 전후 비교

### 변경 전
```
백엔드 → 프론트엔드: http://localhost:3000?token=eyJhbGci...
프론트엔드: URL에서 토큰 추출 → localStorage 저장 → Authorization 헤더로 전송
```

### 변경 후
```
백엔드 → 프론트엔드: http://localhost:3000/ (토큰 없음)
백엔드: Set-Cookie: Authorization=eyJhbGci...; HttpOnly; Secure
프론트엔드: 쿠키 자동 전송 (JavaScript 접근 불가)
```

## ✅ 프론트엔드 변경사항

### 1. URL에서 토큰 읽기 제거
- ❌ `searchParams.get('token')` 제거
- ❌ URL 쿼리 파라미터로 토큰 전달 불필요

### 2. localStorage 토큰 저장 제거
- ❌ `localStorage.setItem('accessToken', token)` 제거
- ❌ `localStorage.getItem('accessToken')` 제거
- ❌ `localStorage.removeItem('accessToken')` 제거

### 3. Authorization 헤더 제거
- ❌ `headers: { 'Authorization': 'Bearer ...' }` 제거
- ✅ 쿠키가 자동으로 전송됨

### 4. 쿠키 자동 전송 설정
- ✅ 모든 API 호출에 `credentials: 'include'` 추가
- ✅ Axios 설정에 `withCredentials: true` 유지

## 🎯 백엔드 구현 필요사항

### 1. 쿠키 설정 (이미 구현되어 있을 것으로 예상)

백엔드에서 로그인 성공 시 쿠키를 설정해야 합니다:

```java
// 예시: Spring Boot
Cookie cookie = new Cookie("Authorization", jwtToken);
cookie.setHttpOnly(true);  // JavaScript 접근 차단
cookie.setSecure(cookieSecure);  // 개발: false, 프로덕션: true
cookie.setPath("/");
cookie.setMaxAge(jwtExpirationSeconds);
cookie.setSameSite("Lax");

response.addCookie(cookie);
```

**쿠키 이름**: `Authorization` (또는 백엔드에서 설정한 이름)

### 2. 리다이렉트 URL 변경

**변경 전**:
```
http://localhost:3000?token=eyJhbGci...
```

**변경 후**:
```
http://localhost:3000/
```
또는 설정된 `login-success-path` (예: `/dashboard`)

**중요**: URL에 토큰을 포함하지 않아야 합니다.

### 3. 필수 API 엔드포인트

#### 3.1 인증 상태 확인 API

**엔드포인트**: `GET /api/auth/me`

**요청**:
- 쿠키에서 `Authorization` 토큰 읽기
- 토큰 검증

**응답 (성공 - 200 OK)**:
```json
{
  "id": "4592221005",
  "email": "user@example.com",
  "name": "사용자 이름",
  "profileImage": "https://..."
}
```

**응답 (실패 - 401 Unauthorized)**:
```json
{
  "error": "Unauthorized",
  "message": "인증이 필요합니다."
}
```

**프론트엔드 사용 예시**:
```typescript
fetch(`${API_BASE_URL}/api/auth/me`, {
  credentials: 'include', // 쿠키 포함
})
```

#### 3.2 로그아웃 API

**엔드포인트**: `POST /api/auth/logout`

**요청**:
- 쿠키에서 `Authorization` 토큰 읽기
- 쿠키 삭제 (Max-Age=0)

**응답 (200 OK)**:
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

**쿠키 삭제 예시**:
```java
// Spring Boot
Cookie cookie = new Cookie("Authorization", null);
cookie.setHttpOnly(true);
cookie.setSecure(cookieSecure);
cookie.setPath("/");
cookie.setMaxAge(0);  // 즉시 삭제

response.addCookie(cookie);
```

**프론트엔드 사용 예시**:
```typescript
await fetch(`${API_BASE_URL}/api/auth/logout`, {
  method: 'POST',
  credentials: 'include', // 쿠키 포함
});
```

### 4. 기존 API 엔드포인트 수정

모든 인증이 필요한 API 엔드포인트에서:

**변경 전**:
```java
// Authorization 헤더에서 토큰 읽기
String token = request.getHeader("Authorization");
if (token != null && token.startsWith("Bearer ")) {
    token = token.substring(7);
}
```

**변경 후**:
```java
// 쿠키에서 토큰 읽기
Cookie[] cookies = request.getCookies();
String token = null;
if (cookies != null) {
    for (Cookie cookie : cookies) {
        if ("Authorization".equals(cookie.getName())) {
            token = cookie.getValue();
            break;
        }
    }
}
```

또는 Spring Security를 사용하는 경우:
```java
@GetMapping("/api/protected")
public ResponseEntity<?> protectedEndpoint(HttpServletRequest request) {
    // 쿠키에서 토큰 읽기
    String token = extractTokenFromCookie(request);
    // 토큰 검증 및 처리
}
```

## 🔍 CORS 설정 확인

프론트엔드에서 `credentials: 'include'`를 사용하므로, 백엔드 CORS 설정이 올바른지 확인하세요:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);  // ✅ 필수!
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**중요**: `allowCredentials: true`가 설정되어 있어야 합니다.

## 📝 프론트엔드 변경된 파일 목록

### 콜백 페이지
- `app/kakao/callback/page.tsx` - URL 토큰 읽기 제거
- `app/naver/callback/page.tsx` - URL 토큰 읽기 제거
- `app/google/callback/page.tsx` - URL 토큰 읽기 제거

### 메인 페이지
- `app/page.tsx` - URL 토큰 읽기 및 localStorage 저장 제거

### API 설정
- `lib/api.ts` - Authorization 헤더 제거, 쿠키 자동 전송 유지

### 대시보드
- `app/dashboard/page.tsx` - localStorage 대신 `/api/auth/me` API 호출, 로그아웃 시 `/api/auth/logout` API 호출

### 상태 관리
- `store/authStore.ts` - 토큰 저장 제거, 인증 상태만 관리

## ⚠️ 주의사항

### 1. 쿠키 이름
- 프론트엔드는 쿠키 이름을 지정하지 않습니다.
- 백엔드에서 설정한 쿠키 이름을 사용합니다.
- 문서에서는 `Authorization`을 예시로 사용했지만, 백엔드에서 설정한 실제 쿠키 이름을 확인하세요.

### 2. 도메인 차이
- 개발 환경: `localhost:3000` (프론트) ↔ `localhost:8080` (백엔드)
- 쿠키는 같은 도메인에서만 전송되므로, CORS 설정이 올바른지 확인하세요.

### 3. 프로덕션 환경
- `COOKIE_SECURE=true` 설정 필수 (HTTPS 사용)
- `SameSite=None; Secure` 설정 고려 (크로스 도메인 쿠키)

### 4. 쿠키 접근 불가
- `HttpOnly` 쿠키는 JavaScript에서 접근 불가
- `document.cookie`로 확인 불가
- 프론트엔드는 백엔드 API로 인증 상태 확인

## 🧪 테스트 방법

### 1. 로그인 테스트
1. 소셜 로그인 버튼 클릭
2. 인증 완료 후 리다이렉트 확인
3. 브라우저 개발자 도구 → Application → Cookies에서 `Authorization` 쿠키 확인
4. **URL에 토큰이 없는지 확인** (중요!)

### 2. 인증 상태 확인 테스트
1. 대시보드 접속
2. Network 탭에서 `/api/auth/me` 요청 확인
3. 요청 헤더에 `Cookie: Authorization=...` 포함 확인
4. 응답으로 사용자 정보 받는지 확인

### 3. API 호출 테스트
1. 인증이 필요한 API 호출
2. Network 탭에서 요청 헤더 확인
3. `Cookie: Authorization=...` 헤더가 자동으로 포함되는지 확인
4. Authorization 헤더는 포함되지 않아야 함

### 4. 로그아웃 테스트
1. 로그아웃 버튼 클릭
2. Network 탭에서 `/api/auth/logout` 요청 확인
3. `Authorization` 쿠키가 삭제되는지 확인 (Max-Age=0)
4. 이후 API 호출 시 401 에러 확인

## 📞 프론트엔드 연락처

프론트엔드 변경사항에 대한 문의사항이 있으면 프론트엔드 팀에 문의하세요.

## 🔄 마이그레이션 체크리스트

백엔드에서 확인해야 할 사항:

- [ ] 로그인 성공 시 쿠키 설정 (HttpOnly, Secure)
- [ ] 리다이렉트 URL에서 토큰 파라미터 제거
- [ ] `GET /api/auth/me` 엔드포인트 구현
- [ ] `POST /api/auth/logout` 엔드포인트 구현
- [ ] 모든 인증 필요 API에서 쿠키에서 토큰 읽기로 변경
- [ ] CORS 설정에서 `allowCredentials: true` 확인
- [ ] 프로덕션 환경에서 `COOKIE_SECURE=true` 설정
- [ ] 로그인/로그아웃 플로우 테스트
- [ ] 인증 필요 API 호출 테스트

