package com.cooltomato.pomki.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class SimpleDashboardStatsDto {
    
    // 오늘의 학습 현황 (숫자 중심)
    private final TodayStudyStats todayStudy;
    
    // 주간 통계 (단순)
    private final WeeklyStats weeklyStats;
    
    // 복습 통계
    private final ReviewStats reviewStats;
    
    // 출석 캘린더 (간단)
    private final List<LocalDate> attendanceDates;
    
    // 총 누적 통계
    private final TotalStats totalStats;

    @Getter
    @Builder
    public static class TodayStudyStats {
        private final long totalFocusMinutes;      // 오늘 총 집중 시간
        private final int pomodoroCompleted;       // 완료된 포모도로 수
        private final int goalMinutes;             // 목표 시간 (기본 240분)
        private final int progressPercentage;      // 목표 달성률
        private final int todayActivities;         // 오늘 활동 수
    }

    @Getter
    @Builder
    public static class WeeklyStats {
        private final int studyDaysThisWeek;       // 이번 주 학습 일수
        private final long totalWeeklyMinutes;    // 이번 주 총 학습 시간
        private final int currentStreak;          // 연속 학습 일수
        private final double avgDailyMinutes;     // 일평균 학습 시간
    }

    @Getter
    @Builder
    public static class ReviewStats {
        private final int todayReviewCards;       // 오늘 복습할 카드 수
        private final int completedReviews;       // 오늘 완료한 복습 수
        private final int upcomingCards;          // 예정된 복습 카드 수 (7일 내)
        private final String mostDifficultCard;   // 가장 어려운 카드
    }

    @Getter
    @Builder
    public static class TotalStats {
        private final long totalNotes;            // 총 노트 수
        private final long totalCards;            // 총 카드 수
        private final long totalStudyDays;        // 총 학습 일수
        private final long totalFocusHours;       // 총 집중 시간 (시간 단위)
    }
} 