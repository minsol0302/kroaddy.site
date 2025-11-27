package site.kroaddy.api.soccer.player;

import site.kroaddy.api.soccer.common.Messenger;

public interface PlayerService {

    Messenger save(PlayerModel playerDTO);

    Messenger findById(Long id);

    Messenger findAll();

    Messenger update(Long id, PlayerModel playerDTO);

    Messenger delete(Long id);

}
