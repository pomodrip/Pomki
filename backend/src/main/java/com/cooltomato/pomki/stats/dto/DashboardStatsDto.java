package com.cooltomato.pomki.stats.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDto {
    
    private TodayStudyDto todayStudy;
    private List<RecentActivityDto> recentActivities;
    private List<TodayActivityDto> todayActivities;
    private TrashDto trashInfo;
    private ReviewScheduleDto reviewSchedule;
    private Map<String, Integer> calendarData;

    @Data
    @Builder
    public static class TodayStudyDto {
        private Integer studyMinutes;
        private Integer goalMinutes;
        private Integer progressPercentage;
        private Integer pomodoroCompleted;
        private Integer pomodoroTotal;
        private Long totalStudyNotes;
        private Long totalFlashcards;
        private Long totalActiveDays;
    }

    @Data
    @Builder
    public static class RecentActivityDto {
        private String activityType;
        private String title;
        private String timeAgo;
        private Long relatedId;
    }

    @Data
    @Builder
    public static class TodayActivityDto {
        private String activityType;
        private String title;
        private String time;
        private Integer duration;
    }

    @Data
    @Builder
    public static class TrashDto {
        private Integer deletedNotesCount;
        private Integer deletedCardsCount;
        private Integer deletedDecksCount;
    }

    @Data
    @Builder
    public static class ReviewScheduleDto {
        private Integer todayCards;
        private Integer within3DaysCards;
        private Integer within7DaysCards;
        private String recommendedCardTitle;
    }
} 