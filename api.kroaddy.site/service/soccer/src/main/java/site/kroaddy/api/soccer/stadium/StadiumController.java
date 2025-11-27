package site.kroaddy.api.soccer.stadium;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import lombok.RequiredArgsConstructor;
import site.kroaddy.api.soccer.common.Messenger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stadiums")
@Tag(name = "경기장", description = "경기장 관리 API")
public class StadiumController {
        private final StadiumService stadiumService;

        @PostMapping("")
        @Operation(summary = "경기장 등록", description = "새로운 경기장을 등록합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "경기장 등록 성공")
        })
        public Messenger save(
                        @Parameter(description = "경기장 정보", required = true) StadiumModel stadiumDTO) {
                return Messenger.builder()
                                .code(200)
                                .message("경기장 등록 성공")
                                .build();
        }

        @GetMapping("/{id}")
        @Operation(summary = "경기장 조회", description = "경기장 ID로 경기장 정보를 조회합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "경기장 조회 성공")
        })
        public Messenger findById(
                        @Parameter(description = "경기장 ID", required = true) @PathVariable Long id) {
                return Messenger.builder()
                                .code(200)
                                .message("경기장 조회 성공")
                                .build();
        }

        @GetMapping("/all")
        @Operation(summary = "전체 경기장 조회", description = "모든 경기장 목록을 조회합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "전체 경기장 조회 성공")
        })
        public Messenger findAll() {
                return Messenger.builder()
                                .code(200)
                                .message("전체 경기장 조회 성공")
                                .build();
        }

        @PutMapping("/{id}")
        @Operation(summary = "경기장 수정", description = "경기장 정보를 수정합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "경기장 수정 성공")
        })
        public Messenger update(
                        @Parameter(description = "경기장 ID", required = true) @PathVariable Long id,
                        @Parameter(description = "경기장 정보", required = true) StadiumModel stadiumDTO) {
                return Messenger.builder()
                                .code(200)
                                .message("경기장 수정 성공")
                                .build();
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "경기장 삭제", description = "경기장을 삭제합니다.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "경기장 삭제 성공")
        })
        public Messenger delete(
                        @Parameter(description = "경기장 ID", required = true) @PathVariable Long id) {
                return Messenger.builder()
                                .code(200)
                                .message("경기장 삭제 성공")
                                .build();
        }
}
