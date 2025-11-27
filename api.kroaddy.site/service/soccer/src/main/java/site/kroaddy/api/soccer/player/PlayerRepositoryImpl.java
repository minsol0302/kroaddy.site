package site.kroaddy.api.soccer.player;

import lombok.RequiredArgsConstructor;
import com.querydsl.jpa.impl.JPAQueryFactory;

@RequiredArgsConstructor
public class PlayerRepositoryImpl implements PlayerRepositoryCustom {
    private final JPAQueryFactory queryFactory;
}
