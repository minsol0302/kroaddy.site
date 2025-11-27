package site.kroaddy.api.soccer.schedule;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import site.kroaddy.api.soccer.common.Messenger;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Override
    public Messenger save(ScheduleModel scheduleDTO) {
        return scheduleRepository.save(scheduleDTO);
    }

    @Override
    public Messenger findById(Long id) {
        return scheduleRepository.findById(id);
    }

    @Override
    public Messenger findAll() {
        return scheduleRepository.findAll();
    }

    @Override
    public Messenger update(Long id, ScheduleModel scheduleDTO) {
        return scheduleRepository.update(id, scheduleDTO);
    }

    @Override
    public Messenger delete(Long id) {
        return scheduleRepository.delete(id);
    }
}
