package site.kroaddy.api.soccer.schedule;

import org.springframework.stereotype.Repository;

import site.kroaddy.api.soccer.common.Messenger;

@Repository
public class ScheduleRepository {

    public Messenger save(ScheduleModel scheduleDTO) {
        return Messenger.builder()
                .code(200)
                .message("경기 일정 등록 성공")
                .build();
    }

    public Messenger findById(Long id) {
        return Messenger.builder()
                .code(200)
                .message("경기 일정 조회 성공")
                .build();
    }

    public Messenger findAll() {
        return Messenger.builder()
                .code(200)
                .message("전체 경기 일정 조회 성공")
                .build();
    }

    public Messenger update(Long id, ScheduleModel scheduleDTO) {
        return Messenger.builder()
                .code(200)
                .message("경기 일정 수정 성공")
                .build();
    }

    public Messenger delete(Long id) {
        return Messenger.builder()
                .code(200)
                .message("경기 일정 삭제 성공")
                .build();
    }
}
