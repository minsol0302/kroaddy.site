package site.kroaddy.api.soccer.schedule;

import jakarta.persistence.*;
import lombok.Data;
import site.kroaddy.api.soccer.stadium.Stadium;

@Entity
@Table(name = "schedules")
@Data
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String stadiumUk;

    private String scheDate;

    private String gubun;

    private String homeTeamUk;
    
    private String awayTeamUk;

    private Integer homeScore;

    private Integer awayScore;

    @ManyToOne
    @JoinColumn(name = "stadium_id")
    private Stadium stadium;

}
