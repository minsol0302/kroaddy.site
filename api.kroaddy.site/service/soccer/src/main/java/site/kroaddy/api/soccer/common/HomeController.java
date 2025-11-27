package site.kroaddy.api.soccer.common;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class HomeController {
    @GetMapping("/")
    public Messenger home() {
        return Messenger.builder()
                .code(200)
                .message("API 서버 실행 중")
                .build();
    }

    @GetMapping("/docs")
    public RedirectView docs() {
        return new RedirectView("/swagger-ui.html");
    }
}
