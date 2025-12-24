# CORS 중복 설정 오류 해결 가이드

## 🔴 문제 증상

브라우저 콘솔에서 다음과 같은 오류가 발생합니다:

```
Access to XMLHttpRequest at 'http://localhost:8080/api/auth/kakao/login' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
The 'Access-Control-Allow-Origin' header contains multiple values 
'http://localhost:3000, http://localhost:3000', but only one is allowed.
```

### 오류 의미
- 백엔드에서 `Access-Control-Allow-Origin` 헤더가 중복으로 설정되고 있음
- 브라우저는 하나의 값만 허용하므로 요청이 차단됨

---

## 🔍 원인 분석

백엔드에서 CORS 설정이 여러 곳에서 중복으로 적용되고 있을 때 발생합니다:

1. **SecurityConfig에서 CORS 설정**
2. **WebMvcConfigurer에서 CORS 설정** (중복 가능)
3. **별도의 CorsFilter Bean** (중복 가능)
4. **다른 필터나 인터셉터에서 CORS 헤더 추가** (중복 가능)

---

## ✅ 해결 방법

### 원칙: 하나의 방법만 사용하세요

CORS 설정은 **반드시 한 곳에서만** 해야 합니다.

---

## 📝 권장 설정 방법

### 방법 1: SecurityConfig 사용 (권장)

**SecurityConfig.java** 파일에만 CORS 설정을 추가하세요:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ CORS 설정
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/login/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("http://localhost:3000?token={token}", true)
            );
        return http.build();
    }

    /**
     * CORS 설정 - 여기서만 설정하세요!
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ✅ 허용할 Origin (한 번만 설정)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        
        // ✅ 허용할 HTTP 메서드
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // ✅ 허용할 헤더
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // ✅ credentials 허용 (쿠키, 인증 정보 포함)
        configuration.setAllowCredentials(true);
        
        // ✅ preflight 요청 캐시 시간 (초)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## ❌ 피해야 할 중복 설정

### 1. WebMvcConfigurer와 SecurityConfig 동시 사용 (❌)

```java
// ❌ SecurityConfig에서 이미 CORS 설정했는데...

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000") // ❌ 중복!
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**해결**: `WebConfig` 클래스를 삭제하거나 `addCorsMappings` 메서드를 주석 처리하세요.

---

### 2. 별도의 CorsFilter Bean (❌)

```java
// ❌ SecurityConfig에서 이미 CORS 설정했는데...

@Bean
public CorsFilter corsFilter() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // ❌ 중복!
    // ...
    return new CorsFilter(source);
}
```

**해결**: 이 Bean을 삭제하거나 주석 처리하세요.

---

### 3. 필터나 인터셉터에서 수동 헤더 추가 (❌)

```java
// ❌ SecurityConfig에서 이미 CORS 설정했는데...

@Component
public class CustomFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        httpResponse.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // ❌ 중복!
        // ...
    }
}
```

**해결**: 수동 헤더 설정을 제거하고 SecurityConfig의 CORS 설정만 사용하세요.

---

## 🔧 수정 체크리스트

백엔드 코드를 확인하고 다음을 수행하세요:

- [ ] **SecurityConfig.java**에서 CORS 설정이 있는지 확인
- [ ] **WebConfig.java** 또는 `WebMvcConfigurer` 구현체가 있는지 확인
  - 있다면 `addCorsMappings` 메서드를 주석 처리하거나 삭제
- [ ] **CorsFilter Bean**이 별도로 등록되어 있는지 확인
  - 있다면 삭제하거나 주석 처리
- [ ] **필터나 인터셉터**에서 CORS 헤더를 수동으로 추가하는지 확인
  - 있다면 제거
- [ ] `allowedOrigins`에 `http://localhost:3000`이 **한 번만** 포함되는지 확인
- [ ] 백엔드 서버 **재시작**

---

## 🧪 테스트 방법

### 1. 브라우저 콘솔 확인

수정 후 브라우저 콘솔(F12)에서 다음을 확인:

**성공 시:**
```
🔹 kakao 로그인 URL 요청: http://localhost:8080/api/auth/kakao/login
✅ kakao 인가 URL 받음
```

**실패 시 (CORS 오류):**
```
Access-Control-Allow-Origin header contains multiple values
```

### 2. Network 탭 확인

1. F12 → Network 탭 열기
2. 로그인 버튼 클릭
3. `/api/auth/kakao/login` 요청 확인

**확인 사항:**
- **Status Code**: `200 OK`
- **Response Headers**:
  - `Access-Control-Allow-Origin: http://localhost:3000` (한 번만!)
  - `Access-Control-Allow-Credentials: true`

---

## 📋 프로덕션 환경 설정

프로덕션 환경에서는 다음과 같이 설정하세요:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // 프로덕션 도메인 추가
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",           // 개발 환경
        "https://yourdomain.com",          // 프로덕션 환경
        "https://www.yourdomain.com"        // www 서브도메인
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## 🆘 문제가 계속 발생한다면

### 1. 백엔드 로그 확인

백엔드 서버 로그에서 CORS 관련 설정이 여러 번 로드되는지 확인하세요.

### 2. 모든 CORS 관련 코드 검색

백엔드 프로젝트에서 다음을 검색하세요:

```bash
# CORS 관련 키워드 검색
grep -r "CorsConfiguration" .
grep -r "addCorsMappings" .
grep -r "CorsFilter" .
grep -r "Access-Control-Allow-Origin" .
```

### 3. 의존성 확인

`pom.xml` 또는 `build.gradle`에서 CORS 관련 의존성이 중복으로 추가되어 있지 않은지 확인하세요.

---

## 📚 참고 자료

- [Spring Security CORS 문서](https://docs.spring.io/spring-security/reference/servlet/integrations/cors.html)
- [MDN CORS 가이드](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Spring Framework CORS 문서](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)

---

## ✅ 요약

1. **CORS 설정은 한 곳에서만** (SecurityConfig 권장)
2. **WebMvcConfigurer의 addCorsMappings 제거**
3. **별도의 CorsFilter Bean 제거**
4. **수동 헤더 설정 제거**
5. **백엔드 서버 재시작**

이 가이드를 따라하면 CORS 중복 설정 오류를 해결할 수 있습니다.

