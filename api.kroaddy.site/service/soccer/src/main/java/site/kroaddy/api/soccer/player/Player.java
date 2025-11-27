package site.kroaddy.api.soccer.player;

import jakarta.persistence.*;
import lombok.Data;
import site.kroaddy.api.soccer.team.Team;

import java.time.LocalDate;

@Entity
@Table(name = "players")
@Data
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String playerUk;

    private String playerName;

    private String ePlayerName;

    private String nickname;

    private String joinYyyy;

    private String position;

    private Integer backNo;

    private String nation;

    private LocalDate birthDate;

    private String solar;

    private String height;

    private String weight;

    private String teamUk;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;
}
