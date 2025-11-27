package site.kroaddy.api.soccer.stadium;

import site.kroaddy.api.soccer.common.Messenger;

public interface StadiumService {

    Messenger save(StadiumModel stadiumDTO);

    Messenger findById(Long id);

    Messenger findAll();

    Messenger update(Long id, StadiumModel stadiumDTO);

    Messenger delete(Long id);

}
