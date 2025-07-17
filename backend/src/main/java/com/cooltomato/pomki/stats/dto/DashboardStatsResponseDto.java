package com.cooltomato.pomki.stats.dto;

import lombok.Getter;
import java.time.LocalDate;
import java.util.List;

@Getter
public class DashboardStatsResponseDto {
    private final TodayStatsDto todayStats;
    private final List<LocalDate> attendanceDates;

    public DashboardStatsResponseDto(TodayStatsDto todayStats, List<LocalDate> attendanceDates) {
        this.todayStats = todayStats;
        this.attendanceDates = attendanceDates;
    }
}

// package com.cooltomato.pomki.stats.dto;

// import lombok.Builder;
// import lombok.Data;

// import java.util.List;
// import java.util.Map;

// @Data
// @Builder
// public class DashboardStatsDto {
    
//     private TodayStudyDto todayStudy;
//     private WeeklyStatsDto weeklyStats;
//     private List<RecentActivityDto> recentActivities;
//     private List<TodayActivityDto> todayActivities;
//     private TrashDto trashInfo;
//     private ReviewScheduleDto reviewSchedule;
//     private Map<String, Integer> calendarData;

//     @Data
//     @Builder
//     public static class TodayStudyDto {
//         private Integer studyMinutes;
//         private Integer goalMinutes;
//         private Integer progressPercentage;
//         private Integer pomodoroCompleted;
//         private Integer pomodoroTotal;
//         private Long totalStudyNotes;
//         private Long totalFlashcards;
//         private Long totalActiveDays;
//     }

//     @Data
//     @Builder
//     public static class WeeklyStatsDto {
//         private Integer studyStreak;          // 연속 학습 일수
//         private Long studyDaysThisWeek;       // 이번 주 학습 일수
//         private Integer totalStudyMinutes;    // 이번 주 총 학습 시간
//         private Integer avgDailyMinutes;      // 일평균 학습 시간
//         private Integer pomodoroCompletionRate; // 포모도로 완성률 (%)
//         private String mostActiveType;        // 가장 활발한 학습 유형
//         private Integer weeklyGoalProgress;   // 주간 목표 달성률 (%)
//     }

//     @Data
//     @Builder
//     public static class RecentActivityDto {
//         private String activityType;
//         private String title;
//         private String timeAgo;
//         private Long relatedId;
//     }

//     @Data
//     @Builder
//     public static class TodayActivityDto {
//         private String activityType;
//         private String title;
//         private String time;
//         private Integer duration;
//     }

//     @Data
//     @Builder
//     public static class TrashDto {
//         private Integer deletedNotesCount;
//         private Integer deletedCardsCount;
//         private Integer deletedDecksCount;
//     }

//     @Data
//     @Builder
//     public static class ReviewScheduleDto {
//         private Integer todayCards;
//         private Integer within3DaysCards;
//         private Integer within7DaysCards;
//         private String recommendedCardTitle;
//     }
// } 