package site.kroaddy.api.soccer.schedule;

import site.kroaddy.api.soccer.common.Messenger;

public interface ScheduleService {

    Messenger save(ScheduleModel scheduleDTO);

    Messenger findById(Long id);

    Messenger findAll();

    Messenger update(Long id, ScheduleModel scheduleDTO);

    Messenger delete(Long id);

}
