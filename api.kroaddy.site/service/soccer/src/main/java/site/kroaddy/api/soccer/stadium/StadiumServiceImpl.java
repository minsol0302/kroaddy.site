package site.kroaddy.api.soccer.stadium;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import site.kroaddy.api.soccer.common.Messenger;

@Service
@RequiredArgsConstructor
public class StadiumServiceImpl implements StadiumService {

    private final StadiumRepository stadiumRepository;

    @Override
    public Messenger save(StadiumModel stadiumDTO) {
        return stadiumRepository.save(stadiumDTO);
    }

    @Override
    public Messenger findById(Long id) {
        return stadiumRepository.findById(id);
    }

    @Override
    public Messenger findAll() {
        return stadiumRepository.findAll();
    }

    @Override
    public Messenger update(Long id, StadiumModel stadiumDTO) {
        return stadiumRepository.update(id, stadiumDTO);
    }

    @Override
    public Messenger delete(Long id) {
        return stadiumRepository.delete(id);
    }
}
