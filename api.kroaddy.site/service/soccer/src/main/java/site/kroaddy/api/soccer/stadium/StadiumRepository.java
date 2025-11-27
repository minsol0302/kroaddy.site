package site.kroaddy.api.soccer.stadium;

import org.springframework.stereotype.Repository;

import site.kroaddy.api.soccer.common.Messenger;

@Repository
public class StadiumRepository {

    public Messenger save(StadiumModel stadiumDTO) {
        return Messenger.builder()
                .code(200)
                .message("경기장 등록 성공")
                .build();
    }

    public Messenger findById(Long id) {
        return Messenger.builder()
                .code(200)
                .message("경기장 조회 성공")
                .build();
    }

    public Messenger findAll() {
        return Messenger.builder()
                .code(200)
                .message("전체 경기장 조회 성공")
                .build();
    }

    public Messenger update(Long id, StadiumModel stadiumDTO) {
        return Messenger.builder()
                .code(200)
                .message("경기장 수정 성공")
                .build();
    }

    public Messenger delete(Long id) {
        return Messenger.builder()
                .code(200)
                .message("경기장 삭제 성공")
                .build();
    }
}
