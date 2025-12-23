package site.protoa.api.google;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import site.protoa.api.google.dto.GoogleUserInfo;
import site.protoa.api.jwt.JwtTokenProvider;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/google")
public class GoogleController {

    private final GoogleService googleService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${frontend.login-callback-url:http://localhost:3000}")
    private String frontendCallbackUrl;

    @Value("${frontend.login-success-path:/}")
    private String loginSuccessPath;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${cookie.same-site:Lax}")
    private String cookieSameSite;

    @Autowired
    public GoogleController(GoogleService googleService, JwtTokenProvider jwtTokenProvider) {
        this.googleService = googleService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * 구글 인가 URL 생성 및 반환
     * 프론트엔드에서 이 URL로 리다이렉트
     * 
     * @param frontendCallbackUrlFromHeader Gateway에서 전달한 프론트엔드 URL
     * @param response                      HttpServletResponse (쿠키 설정용)
     * @return 구글 인가 URL
     */
    @GetMapping("/login")
    public ResponseEntity<Map<String, String>> getGoogleAuthUrl(
            @RequestHeader(value = "X-Frontend-Callback-Url", required = false) String frontendCallbackUrlFromHeader,
            HttpServletResponse response) {
        // 프론트엔드 URL을 쿠키에 저장 (콜백에서 사용)
        if (frontendCallbackUrlFromHeader != null && !frontendCallbackUrlFromHeader.isEmpty()) {
            ResponseCookie frontendUrlCookie = ResponseCookie.from("FrontendCallbackUrl", frontendCallbackUrlFromHeader)
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(300) // 5분 (OAuth 플로우 완료 시간)
                    .sameSite(cookieSameSite.equals("None") ? "None" : cookieSameSite)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, frontendUrlCookie.toString());
        }

        String authUrl = googleService.getAuthorizationUrl();
        Map<String, String> responseMap = new HashMap<>();
        responseMap.put("authUrl", authUrl);
        return ResponseEntity.ok(responseMap);
    }

    /**
     * 구글 인가 코드 콜백 처리
     * 1. 인가 코드로 액세스 토큰 요청
     * 2. 액세스 토큰으로 사용자 정보 요청
     * 3. JWT 발급 (구글 ID 기반)
     * 4. JWT를 쿠키에 저장하고 프론트엔드로 리다이렉트
     * 
     * @param code     구글 인가 코드
     * @param response HttpServletResponse (쿠키 설정용)
     * @return 프론트엔드로 리다이렉트 (쿠키에 JWT 토큰 포함)
     */
    @GetMapping("/callback")
    public ResponseEntity<?> googleCallback(
            @RequestParam("code") String code,
            @RequestHeader(value = "X-Frontend-Callback-Url", required = false) String frontendCallbackUrlFromHeader,
            @CookieValue(value = "FrontendCallbackUrl", required = false) String frontendCallbackUrlFromCookie,
            HttpServletResponse response) {
        try {
            // 1. 인가 코드로 액세스 토큰 요청
            var tokenResponse = googleService.getAccessToken(code);
            if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "구글 토큰 요청 실패"));
            }

            String accessToken = tokenResponse.getAccessToken();

            // 2. 액세스 토큰으로 사용자 정보 요청
            GoogleUserInfo userInfo = googleService.getUserInfo(accessToken);
            if (userInfo == null || userInfo.getId() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("success", false, "message", "구글 사용자 정보 조회 실패"));
            }

            // 3. 구글 ID 추출
            String googleId = userInfo.getId();

            // 4. JWT 및 Refresh Token 발급 (구글 ID를 subject로 사용)
            String jwt = jwtTokenProvider.generateToken(googleId);
            String refreshToken = jwtTokenProvider.generateRefreshToken(googleId);

            // 4-1. 백엔드 터미널에 로그 출력 (보안: 토큰 전체는 출력하지 않음)
            String timestamp = LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("yyyy. MM. dd. a h:mm:ss", Locale.KOREAN));

            System.out.println("\n" + "=".repeat(60));
            System.out.println("[" + timestamp + "] 🔹 구글 로그인 성공");
            System.out.println("User ID: " + googleId);
            System.out.println("Token Length: " + jwt.length());
            System.out.println("Refresh Token Length: " + refreshToken.length());
            System.out.println("=".repeat(60) + "\n");

            // 5. Access Token을 쿠키에 저장 (ResponseCookie로 SameSite 명시적 설정)
            ResponseCookie accessTokenCookie = ResponseCookie.from("Authorization", jwt)
                    .httpOnly(true) // JavaScript 접근 차단 (XSS 방지)
                    .secure(cookieSecure) // HTTPS에서만 전송 (프로덕션: true)
                    .path("/") // 모든 경로에서 사용 가능
                    .maxAge(jwtTokenProvider.getExpiration() / 1000) // 초 단위
                    .sameSite(cookieSameSite.equals("None") ? "None" : cookieSameSite) // Lax, Strict, None
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, accessTokenCookie.toString());

            // 5-1. Refresh Token을 쿠키에 저장 (ResponseCookie로 SameSite 명시적 설정)
            ResponseCookie refreshTokenCookie = ResponseCookie.from("RefreshToken", refreshToken)
                    .httpOnly(true) // JavaScript 접근 차단 (XSS 방지)
                    .secure(cookieSecure) // HTTPS에서만 전송 (프로덕션: true)
                    .path("/") // 모든 경로에서 사용 가능
                    .maxAge(jwtTokenProvider.getRefreshExpiration() / 1000) // 초 단위 (더 긴 만료 시간)
                    .sameSite(cookieSameSite.equals("None") ? "None" : cookieSameSite) // Lax, Strict, None
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

            // 6. 프론트엔드 콜백 페이지로 리다이렉트 (토큰 없는 URL)
            // 우선순위: 헤더 > 쿠키 > 환경 변수
            String callbackUrl = frontendCallbackUrl;
            if (frontendCallbackUrlFromHeader != null && !frontendCallbackUrlFromHeader.isEmpty()) {
                callbackUrl = frontendCallbackUrlFromHeader;
            } else if (frontendCallbackUrlFromCookie != null && !frontendCallbackUrlFromCookie.isEmpty()) {
                callbackUrl = frontendCallbackUrlFromCookie;
            }
            String redirectUrl = callbackUrl + "/login/google/callback";

            // 쿠키 삭제 (사용 완료)
            if (frontendCallbackUrlFromCookie != null) {
                ResponseCookie deleteCookie = ResponseCookie.from("FrontendCallbackUrl", "")
                        .httpOnly(true)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(0)
                        .sameSite(cookieSameSite.equals("None") ? "None" : cookieSameSite)
                        .build();
                response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
            }

            // 디버깅: frontendCallbackUrl과 redirectUrl 값 확인
            System.out.println("[GoogleController] frontendCallbackUrlFromHeader: " + frontendCallbackUrlFromHeader);
            System.out.println("[GoogleController] frontendCallbackUrlFromCookie: " + frontendCallbackUrlFromCookie);
            System.out.println("[GoogleController] frontendCallbackUrl (env): " + frontendCallbackUrl);
            System.out.println("[GoogleController] callbackUrl (used): " + callbackUrl);
            System.out.println("[GoogleController] redirectUrl: " + redirectUrl);

            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, redirectUrl)
                    .build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message",
                            "구글 로그인 처리 중 오류: " + e.getMessage()));
        }
    }
}