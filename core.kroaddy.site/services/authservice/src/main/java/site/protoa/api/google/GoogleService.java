package site.protoa.api.google;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import site.protoa.api.google.dto.GoogleTokenResponse;
import site.protoa.api.google.dto.GoogleUserInfo;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GoogleService {

    private final WebClient webClient;

    @Value("${google.client-id}")
    private String googleClientId;

    @Value("${google.client-secret}")
    private String googleClientSecret;

    @Value("${google.redirect-uri}")
    private String googleRedirectUri;

    @Autowired
    public GoogleService(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * 구글 인가 URL 생성
     * 
     * @return 구글 인가 URL
     */
    public String getAuthorizationUrl() {
        return UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", googleRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .toUriString();
    }

    /**
     * 인가 코드로 액세스 토큰 요청
     * 
     * @param code 인가 코드
     * @return GoogleTokenResponse
     */
    public GoogleTokenResponse getAccessToken(String code) {
        Map<String, String> formData = new HashMap<>();
        formData.put("code", code);
        formData.put("client_id", googleClientId);
        formData.put("client_secret", googleClientSecret);
        formData.put("redirect_uri", googleRedirectUri);
        formData.put("grant_type", "authorization_code");

        String bodyString = formData.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "="
                        + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        return webClient.post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(bodyString)
                .retrieve()
                .bodyToMono(GoogleTokenResponse.class)
                .block();
    }

    /**
     * 액세스 토큰으로 사용자 정보 요청
     * 
     * @param accessToken 액세스 토큰
     * @return GoogleUserInfo
     */
    public GoogleUserInfo getUserInfo(String accessToken) {
        return webClient.get()
                .uri("https://www.googleapis.com/oauth2/v2/userinfo")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(GoogleUserInfo.class)
                .block();
    }
}