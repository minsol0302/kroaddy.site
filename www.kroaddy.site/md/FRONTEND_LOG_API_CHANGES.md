# 프론트엔드 로그 API 변경사항 가이드

## 📋 개요

프론트엔드에서 로그 전송 방식이 변경되었습니다. 이전에는 Next.js API 라우트(`/api/log/login`)를 통해 로그를 기록했지만, 이제는 **백엔드 API로 직접 전송**하도록 변경되었습니다.

## 🔄 변경 내용

### 이전 구조
```
프론트엔드 → Next.js API 라우트 (/api/log/login) → 콘솔 출력
```

### 변경 후 구조
```
프론트엔드 → 백엔드 API (http://localhost:8080/api/log/login) → 백엔드 콘솔 출력
```

## 🎯 백엔드 구현 필요사항

백엔드에 다음 엔드포인트를 구현해야 합니다:

### 엔드포인트
- **URL**: `POST /api/log/login`
- **Base URL**: `http://localhost:8080` (또는 `NEXT_PUBLIC_API_BASE_URL` 환경 변수 값)

### 요청 형식

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "action": "string",      // 로그 액션 설명 (예: "Gateway 카카오 연결 시작", "로그인 성공")
  "url": "string",          // (선택) 관련 URL
  "tokenLength": number    // (선택) 토큰 길이
}
```

### 요청 예시

#### 1. Gateway 연결 시작 로그
```json
{
  "action": "Gateway 카카오 연결 시작"
}
```

```json
{
  "action": "Gateway 네이버 연결 시작"
}
```

```json
{
  "action": "Gateway 구글 연결 시작"
}
```

#### 2. 로그인 성공 로그
```json
{
  "action": "로그인 성공",
  "url": "http://localhost:3000/?token=eyJhbGciOiJIUzI1NiJ9...",
  "tokenLength": 137
}
```

### 응답 형식

**성공 응답** (200 OK):
```json
{
  "success": true,
  "message": "로그가 기록되었습니다."
}
```

**실패 응답** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "로그 기록 실패"
}
```

## 📝 백엔드 구현 예시

### Spring Boot 예시

```java
@RestController
@RequestMapping("/api/log")
public class LogController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> logLogin(@RequestBody LogRequest request) {
        try {
            String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy. MM. dd. a h:mm:ss", Locale.KOREAN));
            
            System.out.println("\n" + "=".repeat(60));
            System.out.println("[" + timestamp + "] 🔹 " + request.getAction());
            System.out.println("URL: " + (request.getUrl() != null ? request.getUrl() : "N/A"));
            if (request.getTokenLength() != null) {
                System.out.println("Token Length: " + request.getTokenLength());
            }
            System.out.println("=".repeat(60) + "\n");
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "로그가 기록되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ 로그인 로그 기록 실패: " + e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "로그 기록 실패");
            
            return ResponseEntity.status(500).body(response);
        }
    }
}

@Data
class LogRequest {
    private String action;
    private String url;
    private Integer tokenLength;
}
```

### CORS 설정

백엔드에서 CORS를 허용해야 합니다:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## 🔍 프론트엔드 변경 파일 목록

다음 파일들이 백엔드 API로 직접 전송하도록 변경되었습니다:

1. `app/page.tsx` - 메인 로그인 페이지 (4곳)
   - 로그인 성공 로그
   - 카카오/네이버/구글 연결 시작 로그

2. `app/kakao/callback/page.tsx` - 카카오 콜백 페이지
   - 로그인 성공 로그

3. `app/naver/callback/page.tsx` - 네이버 콜백 페이지
   - 로그인 성공 로그

4. `app/google/callback/page.tsx` - 구글 콜백 페이지
   - 로그인 성공 로그

5. `lib/api.ts` - API 유틸리티
   - `API_BASE_URL` export 추가

## ⚠️ 주의사항

1. **환경 변수**: 프론트엔드는 `NEXT_PUBLIC_API_BASE_URL` 환경 변수를 사용합니다. 기본값은 `http://localhost:8080`입니다.

2. **에러 처리**: 프론트엔드에서는 `.catch(() => {})`로 에러를 무시하고 있으므로, 백엔드에서 로그 기록 실패가 발생해도 사용자 경험에는 영향을 주지 않습니다.

3. **로그 형식**: 백엔드에서 로그를 출력할 때는 기존 Next.js API 라우트와 동일한 형식을 유지하는 것을 권장합니다:
   ```
   ============================================================
   [2025. 11. 28. 오전 9:34:55] 🔹 Gateway 카카오 연결 시작
   URL: N/A
   ============================================================
   ```

4. **보안**: 프로덕션 환경에서는 로그 엔드포인트에 적절한 인증/인가를 추가하는 것을 권장합니다.

## 🧪 테스트 방법

1. 백엔드 서버를 실행합니다 (`http://localhost:8080`)
2. 프론트엔드 서버를 실행합니다 (`http://localhost:3000`)
3. 로그인 버튼을 클릭하거나 로그인을 완료합니다
4. 백엔드 터미널에서 로그가 출력되는지 확인합니다
5. 프론트엔드(Next.js) 터미널에는 로그가 출력되지 않아야 합니다

## 📞 문의

프론트엔드 변경사항에 대한 문의사항이 있으면 프론트엔드 팀에 문의하세요.

