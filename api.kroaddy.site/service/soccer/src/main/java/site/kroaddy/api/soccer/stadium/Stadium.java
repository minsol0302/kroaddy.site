package site.kroaddy.api.soccer.stadium;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

import site.kroaddy.api.soccer.schedule.Schedule;
import site.kroaddy.api.soccer.team.Team;

@Entity
@Table(name = "stadiums")
@Data
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stadiumUk;

    private String stadiumName;

    private String hometeamUk;

    private Integer seatCount;

    private String address;

    private String ddd;

    private String tel;

    @OneToMany(mappedBy = "stadium")
    private List<Team> teams;

    @OneToMany(mappedBy = "stadium")
    private List<Schedule> schedules;
}
