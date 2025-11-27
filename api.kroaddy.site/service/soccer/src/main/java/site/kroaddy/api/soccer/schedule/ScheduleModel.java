package site.kroaddy.api.soccer.schedule;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleModel {

    private Long id;
    private String scheDate;
    private Long stadiumId;
    private String gubun;
    private Long homeTeamId;
    private Long awayTeamId;
    private Integer homeScore;
    private Integer awayScore;
}
