package site.protoa.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 요청의 Origin 헤더를 확인하여 프론트엔드 콜백 URL을 결정하는 필터
 * localhost:3000 -> www.kroaddy.site
 * localhost:4000 -> admin.kroaddy.site
 */
@Component
public class FrontendCallbackUrlFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(FrontendCallbackUrlFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // /api/auth/** 경로에서만 적용
        if (path.startsWith("/api/auth/")) {
            String origin = exchange.getRequest().getHeaders().getFirst(HttpHeaders.ORIGIN);
            String referer = exchange.getRequest().getHeaders().getFirst(HttpHeaders.REFERER);

            // Origin 또는 Referer에서 프론트엔드 URL 추출
            String frontendUrl = determineFrontendUrl(origin, referer);

            if (frontendUrl != null) {
                log.debug("[FrontendCallbackUrlFilter] Origin: {}, Referer: {}, Determined frontend URL: {}",
                        origin, referer, frontendUrl);

                // 헤더에 프론트엔드 URL 추가 (auth-service에서 사용)
                ServerWebExchange modifiedExchange = exchange.mutate()
                        .request(builder -> builder.header("X-Frontend-Callback-Url", frontendUrl))
                        .build();

                return chain.filter(modifiedExchange);
            } else {
                log.debug("[FrontendCallbackUrlFilter] Could not determine frontend URL from Origin: {}, Referer: {}",
                        origin, referer);
            }
        }

        return chain.filter(exchange);
    }

    /**
     * Origin 또는 Referer 헤더에서 프론트엔드 URL 결정
     */
    private String determineFrontendUrl(String origin, String referer) {
        // Origin 우선 확인
        if (origin != null) {
            if (origin.startsWith("http://localhost:3000") || origin.startsWith("https://localhost:3000")) {
                return "http://localhost:3000";
            } else if (origin.startsWith("http://localhost:4000") || origin.startsWith("https://localhost:4000")) {
                return "http://localhost:4000";
            }
        }

        // Referer 확인
        if (referer != null) {
            if (referer.startsWith("http://localhost:3000") || referer.startsWith("https://localhost:3000")) {
                return "http://localhost:3000";
            } else if (referer.startsWith("http://localhost:4000") || referer.startsWith("https://localhost:4000")) {
                return "http://localhost:4000";
            }
        }

        return null;
    }

    @Override
    public int getOrder() {
        // 다른 필터들보다 먼저 실행되도록 설정
        return Ordered.HIGHEST_PRECEDENCE + 1;
    }
}
