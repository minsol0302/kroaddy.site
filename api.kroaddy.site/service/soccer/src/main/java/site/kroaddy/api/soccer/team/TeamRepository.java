package site.kroaddy.api.soccer.team;

import org.springframework.stereotype.Repository;

import site.kroaddy.api.soccer.common.Messenger;

@Repository
public class TeamRepository {

    public Messenger save(TeamModel teamDTO) {
        return Messenger.builder()
                .code(200)
                .message("팀 등록 성공")
                .build();
    }

    public Messenger findById(Long id) {
        return Messenger.builder()
                .code(200)
                .message("팀 조회 성공")
                .build();
    }

    public Messenger findAll() {
        return Messenger.builder()
                .code(200)
                .message("전체 팀 조회 성공")
                .build();
    }

    public Messenger update(Long id, TeamModel teamDTO) {
        return Messenger.builder()
                .code(200)
                .message("팀 수정 성공")
                .build();
    }

    public Messenger delete(Long id) {
        return Messenger.builder()
                .code(200)
                .message("팀 삭제 성공")
                .build();
    }
}
