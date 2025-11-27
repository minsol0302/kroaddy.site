package site.kroaddy.api.soccer.team;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import site.kroaddy.api.soccer.common.Messenger;

@Service
@RequiredArgsConstructor
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;

    @Override
    public Messenger save(TeamModel teamDTO) {
        return teamRepository.save(teamDTO);
    }

    @Override
    public Messenger findById(Long id) {
        return teamRepository.findById(id);
    }

    @Override
    public Messenger findAll() {
        return teamRepository.findAll();
    }

    @Override
    public Messenger update(Long id, TeamModel teamDTO) {
        return teamRepository.update(id, teamDTO);
    }

    @Override
    public Messenger delete(Long id) {
        return teamRepository.delete(id);
    }
}
