package site.kroaddy.api.soccer.player;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import site.kroaddy.api.soccer.common.Messenger;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PlayerServiceImple implements PlayerService {

    private final PlayerRepository playerRepository;

    @Override
    @Transactional
    public Messenger save(PlayerModel playerDTO) {
        log.info("선수 등록 요청: {}", playerDTO);
        // TODO: PlayerModel을 Player 엔티티로 변환하여 저장
        return Messenger.builder()
                .code(200)
                .message("선수 등록 성공")
                .build();
    }

    @Override
    public Messenger findById(Long id) {
        log.info("선수 조회 요청: ID={}", id);
        
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("선수를 찾을 수 없습니다: ID={}", id);
                    return new RuntimeException("선수를 찾을 수 없습니다. ID: " + id);
                });
        
        log.info("선수 조회 성공: {}", player.getPlayerName());
        
        return Messenger.builder()
                .code(200)
                .message("선수 조회 성공")
                .data(player)
                .build();
    }

    @Override
    public Messenger findAll() {
        log.info("전체 선수 조회 요청");
        
        List<Player> players = playerRepository.findAll();
        log.info("조회된 선수 수: {}", players.size());
        
        // Player 엔티티를 PlayerModel로 변환 (선택사항)
        List<PlayerModel> playerModels = players.stream()
                .map(this::convertToModel)
                .collect(Collectors.toList());
        
        return Messenger.builder()
                .code(200)
                .message("전체 선수 조회 성공 - 총 " + players.size() + "명")
                .data(playerModels)
                .build();
    }

    @Override
    @Transactional
    public Messenger update(Long id, PlayerModel playerDTO) {
        log.info("선수 수정 요청: ID={}, 데이터={}", id, playerDTO);
        // TODO: Player 엔티티 조회 후 수정
        return Messenger.builder()
                .code(200)
                .message("선수 수정 성공")
                .build();
    }

    @Override
    @Transactional
    public Messenger delete(Long id) {
        log.info("선수 삭제 요청: ID={}", id);
        
        if (!playerRepository.existsById(id)) {
            log.warn("삭제할 선수를 찾을 수 없습니다: ID={}", id);
            return Messenger.builder()
                    .code(404)
                    .message("선수를 찾을 수 없습니다. ID: " + id)
                    .build();
        }
        
        playerRepository.deleteById(id);
        log.info("선수 삭제 완료: ID={}", id);
        
        return Messenger.builder()
                .code(200)
                .message("선수 삭제 성공")
                .build();
    }
    
    /**
     * Player 엔티티를 PlayerModel로 변환
     */
    private PlayerModel convertToModel(Player player) {
        return PlayerModel.builder()
                .id(player.getId())
                .playerName(player.getPlayerName())
                .ePlayerName(player.getEPlayerName())
                .nickname(player.getNickname())
                .joinYyyy(player.getJoinYyyy())
                .position(player.getPosition())
                .backNo(player.getBackNo())
                .nation(player.getNation())
                .birthDate(player.getBirthDate())
                .solar(player.getSolar())
                .height(player.getHeight())
                .weight(player.getWeight())
                .teamId(player.getTeam() != null ? player.getTeam().getId() : null)
                .build();
    }
}
