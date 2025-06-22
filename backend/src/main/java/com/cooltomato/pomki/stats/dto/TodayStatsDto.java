package com.cooltomato.pomki.stats.dto;

import lombok.Getter;

@Getter
public class TodayStatsDto {
    private final long totalFocusMinutes;
    private final long pomodoroSessionsCompleted;

    // Repository에서 Long으로 받지만, null일 경우를 대비하여 0으로 초기화합니다.
    public TodayStatsDto(Long totalFocusMinutes, Long pomodoroSessionsCompleted) {
        this.totalFocusMinutes = (totalFocusMinutes!= null)? totalFocusMinutes : 0L;
        this.pomodoroSessionsCompleted = (pomodoroSessionsCompleted!= null)? pomodoroSessionsCompleted : 0L;
    }
}