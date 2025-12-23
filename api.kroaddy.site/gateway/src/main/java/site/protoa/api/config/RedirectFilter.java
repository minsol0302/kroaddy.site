package site.protoa.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Gateway에서 리다이렉트 응답의 Location 헤더를 보존하는 필터
 * 백엔드 서비스가 반환한 절대 URL 리다이렉트를 그대로 전달
 */
@Component
public class RedirectFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RedirectFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String requestPath = exchange.getRequest().getURI().getPath();
        log.debug("[RedirectFilter] Processing request: {}", requestPath);

        ServerHttpResponse originalResponse = exchange.getResponse();

        // 응답을 래핑하여 Location 헤더를 보존
        ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
            @Override
            public Mono<Void> writeWith(org.reactivestreams.Publisher<? extends DataBuffer> body) {
                // 응답이 작성되기 전에 Location 헤더 확인
                org.springframework.http.HttpStatusCode statusCode = getStatusCode();

                // 리다이렉트 응답인 경우 Location 헤더 확인 및 보존
                if (statusCode != null && statusCode.is3xxRedirection()) {
                    HttpHeaders headers = getHeaders();
                    String location = headers.getFirst(HttpHeaders.LOCATION);

                    log.info("[RedirectFilter] Redirect response detected. Status: {}, Location: {}", statusCode,
                            location);

                    // Location 헤더가 절대 URL인 경우 그대로 보존
                    // 상대 경로로 잘못 해석되는 것을 방지
                    if (location != null && location.startsWith("http")) {
                        // 절대 URL이면 명시적으로 재설정하여 보존
                        log.info("[RedirectFilter] Preserving absolute URL: {}", location);
                        headers.remove(HttpHeaders.LOCATION);
                        headers.set(HttpHeaders.LOCATION, location);
                    } else if (location != null && !location.startsWith("http")) {
                        // 상대 경로인 경우, 프론트엔드 호스트를 기준으로 절대 URL로 변환
                        String frontendUrl = "http://localhost:3000";
                        String absoluteUrl = frontendUrl + (location.startsWith("/") ? location : "/" + location);
                        log.info("[RedirectFilter] Converting relative URL to absolute: {} -> {}", location,
                                absoluteUrl);
                        headers.remove(HttpHeaders.LOCATION);
                        headers.set(HttpHeaders.LOCATION, absoluteUrl);
                    } else {
                        log.warn("[RedirectFilter] Location header is null or empty for redirect response. Status: {}",
                                statusCode);
                    }
                }

                return super.writeWith(body);
            }
        };

        return chain.filter(exchange.mutate().response(decoratedResponse).build());
    }

    @Override
    public int getOrder() {
        // 다른 필터들보다 먼저 실행되도록 설정
        return -1;
    }
}
