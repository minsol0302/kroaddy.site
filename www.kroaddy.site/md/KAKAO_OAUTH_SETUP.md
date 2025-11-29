# 카카오 OAuth2 로그인 구현 가이드

## 📋 목차
1. [필요한 키 종류](#필요한-키-종류)
2. [카카오 개발자 콘솔 설정](#카카오-개발자-콘솔-설정)
3. [Next.js 프론트엔드 설정](#nextjs-프론트엔드-설정)
4. [스프링 백엔드 설정](#스프링-백엔드-설정)
5. [전체 인증 플로우](#전체-인증-플로우)
6. [보안 주의사항](#보안-주의사항)

---

## 🔑 필요한 키 종류

### ✅ 필수 키

#### 1. **Kakao REST API Key** (필수)
- **역할**: 서버에서 토큰 교환, 사용자 정보 요청 시 사용
- **사용 위치**: 스프링 Gateway, User-Service
- **절대 외부에 노출되면 안 됨**
- **발급 위치**: 카카오 개발자 콘솔 → 앱 설정 → 앱 키 → REST API 키

#### 2. **Kakao Client Secret** (선택이지만 사실상 필수)
- **역할**: OAuth2 클라이언트 인증 강화
- **사용 위치**: 스프링 Gateway
- **MSA 기반이라면 외부 공개 위험이 있으므로 Secret 사용이 안정적**
- **발급 위치**: 카카오 개발자 콘솔 → 앱 설정 → 보안 → Client Secret 활성화

#### 3. **Redirect URI** (필수 설정값)
- **Next.js**: `http://localhost:3000/auth/kakao/callback`
- **Gateway**: `http://localhost:8080/login/oauth2/code/kakao`
- **카카오 콘솔에서 반드시 등록해야 함**

### ⚠️ 선택 키

#### 4. **Kakao JavaScript Key** (프론트에서 직접 SDK 사용 시에만)
- **역할**: React/Next.js에서 직접 카카오 SDK로 로그인할 경우
- **MSA는 백엔드에서 OAuth 코드를 처리하는 구조라면 JS Key는 불필요**
- **발급 위치**: 카카오 개발자 콘솔 → 앱 설정 → 앱 키 → JavaScript 키

### 🛑 절대 사용하지 말 것

#### 5. **Admin Key**
- **카카오톡 메시지 보내기, 푸시 알림 등 고급 기능용**
- **로그인(OAuth2)에는 절대 사용하지 말 것**
- **노출되면 탈취될 위험이 매우 큼**

---

## 🎯 카카오 개발자 콘솔 설정

### 1. 앱 생성 및 키 발급
1. [카카오 개발자 콘솔](https://developers.kakao.com/) 접속
2. 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름, 사업자명 입력 후 생성

### 2. 플랫폼 설정
1. **플랫폼 설정** → **Web 플랫폼 등록**
   - 사이트 도메인: `http://localhost:3000` (개발 환경)
   - 사이트 도메인: `https://yourdomain.com` (프로덕션)

### 3. Redirect URI 등록
1. **제품 설정** → **카카오 로그인** → **활성화 설정** → **ON**
2. **Redirect URI** 등록:
   ```
   http://localhost:3000/auth/kakao/callback
   http://localhost:8080/login/oauth2/code/kakao
   ```
   (프로덕션 환경도 동일하게 등록)

### 4. Client Secret 활성화
1. **앱 설정** → **보안** → **Client Secret** → **활성화**
2. 생성된 Client Secret 복사 (한 번만 표시되므로 안전하게 보관)

### 5. 동의 항목 설정
1. **제품 설정** → **카카오 로그인** → **동의항목**
2. 필수 동의 항목:
   - 닉네임 (필수)
   - 프로필 사진 (선택)
   - 카카오계정(이메일) (선택)

---

## 💻 Next.js 프론트엔드 설정

### 1. 환경 변수 설정

`.env.local` 파일 생성 (`.gitignore`에 추가되어 있어야 함):

```env
# 카카오 OAuth2 설정
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key_here
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8081
```

### 2. 카카오 로그인 버튼 사용

```tsx
import KakaoLoginButton from '@/components/KakaoLoginButton';

export default function LoginPage() {
  return (
    <div>
      <KakaoLoginButton />
    </div>
  );
}
```

### 3. 이미 생성된 파일들
- ✅ `src/components/KakaoLoginButton.tsx` - 카카오 로그인 버튼 컴포넌트
- ✅ `src/app/auth/kakao/callback/page.tsx` - 카카오 로그인 콜백 페이지
- ✅ `src/app/api/auth/kakao/route.ts` - 카카오 로그인 API 라우트
- ✅ `src/lib/api.ts` - API 클라이언트 (카카오 로그인 함수 포함)

---

## ☕ 스프링 백엔드 설정

### 1. 의존성 추가 (Gateway Service)

`pom.xml` 또는 `build.gradle`:

```xml
<!-- Spring Security OAuth2 Client -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>

<!-- JWT (토큰 발급용) -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

### 2. application.yml 설정 (Gateway Service)

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
            client-name: Kakao
        provider:
          kakao:
            authorization-uri: https://kauth.kakao.com/oauth/authorize
            token-uri: https://kauth.kakao.com/oauth/token
            user-info-uri: https://kapi.kakao.com/v2/user/me
            user-name-attribute: id

# 환경 변수 (Railway/AWS/K8s 등에 설정)
# KAKAO_CLIENT_ID=your_kakao_rest_api_key
# KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

### 3. Security Config (Gateway Service)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("http://localhost:3000/auth/kakao/callback", true)
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService())
                )
            )
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:3000")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService() {
        return new CustomOAuth2UserService();
    }
}
```

### 4. Custom OAuth2UserService (Gateway Service)

```java
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private UserServiceClient userServiceClient; // Feign Client

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = new DefaultOAuth2UserService().loadUser(userRequest);

        // 카카오 사용자 정보 추출
        Map<String, Object> attributes = oauth2User.getAttributes();
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String kakaoId = String.valueOf(attributes.get("id"));
        String email = (String) kakaoAccount.get("email");
        String nickname = (String) profile.get("nickname");
        String profileImage = (String) profile.get("profile_image_url");

        // User-Service에 사용자 정보 저장/조회 요청
        UserDto userDto = userServiceClient.getOrCreateUser(
            kakaoId, email, nickname, profileImage
        );

        // JWT 토큰 생성
        String accessToken = generateJwtToken(userDto);

        // 토큰을 쿠키에 설정하거나 응답에 포함
        // ...

        return oauth2User;
    }

    private String generateJwtToken(UserDto userDto) {
        // JWT 토큰 생성 로직
        return Jwts.builder()
            .setSubject(userDto.getId().toString())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24시간
            .signWith(SignatureAlgorithm.HS256, "your-secret-key")
            .compact();
    }
}
```

### 5. User-Service API (Feign Client)

```java
@FeignClient(name = "user-service", url = "http://user-service:8082")
public interface UserServiceClient {

    @PostMapping("/api/users/kakao")
    UserDto getOrCreateUser(
        @RequestParam String kakaoId,
        @RequestParam String email,
        @RequestParam String nickname,
        @RequestParam String profileImage
    );

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable Long id);
}
```

### 6. 환경 변수 설정 (프로덕션)

**Railway / AWS / K8s 환경 변수:**
```
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
```

---

## 🔄 전체 인증 플로우

```
1. 사용자가 "카카오로 로그인" 버튼 클릭
   ↓
2. Next.js → Gateway로 리다이렉트
   GET http://localhost:8081/oauth2/authorization/kakao
   ↓
3. Gateway → 카카오 인증 페이지로 리다이렉트
   GET https://kauth.kakao.com/oauth/authorize?client_id=...&redirect_uri=...
   ↓
4. 사용자가 카카오에서 로그인 및 동의
   ↓
5. 카카오 → Gateway로 Authorization Code 전달
   GET http://localhost:8080/login/oauth2/code/kakao?code=...
   ↓
6. Gateway가 Code를 Access Token으로 교환
   POST https://kauth.kakao.com/oauth/token
   ↓
7. Gateway가 Access Token으로 사용자 정보 조회
   GET https://kapi.kakao.com/v2/user/me
   ↓
8. Gateway → User-Service에 사용자 정보 저장/조회 요청
   POST http://user-service:8082/api/users/kakao
   ↓
9. Gateway가 JWT 토큰 생성 후 Next.js로 리다이렉트
   GET http://localhost:3000/auth/kakao/callback?token=...
   ↓
10. Next.js가 토큰을 저장하고 메인 페이지로 이동
```

---

## 🔒 보안 주의사항

### ⚠️ 절대 하지 말아야 할 것

1. **GitHub에 키 노출 금지**
   - `.env.local`, `application.yml`에 실제 키를 직접 작성하지 말 것
   - 환경 변수로 분리 필수

2. **프론트엔드에 Client Secret 노출 금지**
   - Client Secret은 백엔드(Gateway)에서만 사용
   - `NEXT_PUBLIC_` 접두사가 붙은 변수는 브라우저에 노출됨

3. **Admin Key를 로그인에 사용하지 말 것**
   - Admin Key는 고급 기능용
   - 로그인에는 절대 사용 금지

### ✅ 보안 모범 사례

1. **환경 변수 분리**
   - 개발: `.env.local`
   - 프로덕션: Railway/AWS/K8s 환경 변수

2. **HTTPS 사용**
   - 프로덕션 환경에서는 반드시 HTTPS 사용

3. **토큰 관리**
   - Access Token: 짧은 만료 시간 (24시간)
   - Refresh Token: 긴 만료 시간 (7일)
   - HttpOnly 쿠키 사용 권장

4. **CORS 설정**
   - Gateway에서 허용된 도메인만 접근 가능하도록 설정

---

## 📝 키 사용 위치 정리

| 키 종류 | Gateway | User-Service | Next.js |
|---------|---------|--------------|---------|
| REST API Key | ✅ 사용 | ❌ 불필요 | ❌ 불필요 |
| Client Secret | ✅ 사용 | ❌ 불필요 | ❌ 불필요 |
| Redirect URI | ✅ 사용 | ❌ 불필요 | ✅ 사용 |
| JavaScript Key | ❌ 불필요 | ❌ 불필요 | ⚠️ 선택적 |

---

## 🚀 다음 단계

1. 카카오 개발자 콘솔에서 앱 생성 및 키 발급
2. `.env.local` 파일 생성 및 키 설정
3. 스프링 Gateway에 OAuth2 설정 추가
4. User-Service에 사용자 정보 저장 로직 구현
5. 테스트 및 배포

---

## 📚 참고 자료

- [카카오 개발자 문서 - 카카오 로그인](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- [Spring Security OAuth2 Client](https://docs.spring.io/spring-security/reference/servlet/oauth2/client/index.html)
- [Next.js 환경 변수](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

