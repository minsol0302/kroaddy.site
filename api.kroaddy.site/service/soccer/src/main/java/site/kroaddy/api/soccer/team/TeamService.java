package site.kroaddy.api.soccer.team;

import site.kroaddy.api.soccer.common.Messenger;

public interface TeamService {

    Messenger save(TeamModel teamDTO);

    Messenger findById(Long id);

    Messenger findAll();

    Messenger update(Long id, TeamModel teamDTO);

    Messenger delete(Long id);

}
