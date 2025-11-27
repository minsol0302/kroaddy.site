package site.kroaddy.api.soccer.common;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Messenger {
    private int code;
    private String message;
    private Object data; // 응답 데이터를 담을 필드 추가
}
