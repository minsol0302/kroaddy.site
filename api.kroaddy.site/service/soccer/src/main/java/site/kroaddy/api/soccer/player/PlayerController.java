package site.kroaddy.api.soccer.player;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import lombok.RequiredArgsConstructor;

import site.kroaddy.api.soccer.common.Messenger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/players")
@Tag(name = "선수", description = "선수 관리 API")
public class PlayerController {
        private final PlayerService playerService;

        @PostMapping("")
        @Operation(summary = "선수 등록", description = "새로운 선수를 등록합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "선수 등록 성공")
        })
        public Messenger save(
                        @Parameter(description = "선수 정보", required = true) PlayerModel playerDTO) {
                return Messenger.builder()
                                .code(200)
                                .message("선수 등록 성공")
                                .build();
        }

        @GetMapping("/{id}")
        @Operation(summary = "선수 조회", description = "선수 ID로 선수 정보를 조회합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "선수 조회 성공")
        })
        public Messenger findById(
                        @Parameter(description = "선수 ID", required = true) @PathVariable Long id) {
                return Messenger.builder()
                                .code(200)
                                .message("선수 조회 성공")
                                .build();
        }

        @GetMapping("/all")
        @Operation(summary = "전체 선수 조회", description = "모든 선수 목록을 조회합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "전체 선수 조회 성공")
        })
        public Messenger findAll(
                        @RequestParam(value = "question", required = false) String question,
                        @RequestParam(value = "history", required = false) String history) {

                 // ⭐ 파라미터 출력
                 log.info("=".repeat(60));
                 log.info("🎯 전체 선수 조회 요청 받음!");
                 log.info("📝 질문(question): {}", question);
                 log.info("📜 히스토리(history): {}", history);
                 log.info("=".repeat(60));

                // System.out.println도 함께 출력 (확실한 확인용)
                System.out.println("=".repeat(60));
                System.out.println("🎯 전체 선수 조회 요청 받음!");
                System.out.println("📝 질문(question): " + question);
                System.out.println("📜 히스토리(history): " + history);
                System.out.println("=".repeat(60));

                return playerService.findAll();
        }

        @PutMapping("/{id}")
        @Operation(summary = "선수 수정", description = "선수 정보를 수정합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "선수 수정 성공")
        })
        public Messenger update(
                        @Parameter(description = "선수 ID", required = true) @PathVariable Long id,
                        @Parameter(description = "선수 정보", required = true) PlayerModel playerDTO) {
                return Messenger.builder()
                                .code(200)
                                .message("선수 수정 성공")
                                .build();
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "선수 삭제", description = "선수를 삭제합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "선수 삭제 성공")
        })
        public Messenger delete(
                        @Parameter(description = "선수 ID", required = true) @PathVariable Long id) {
                return Messenger.builder()
                                .code(200)
                                .message("선수 삭제 성공")
                                .build();
        }
}
