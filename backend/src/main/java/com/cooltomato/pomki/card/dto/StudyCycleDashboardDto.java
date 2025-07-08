package com.cooltomato.pomki.card.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 학습 주기 대시보드용 DTO
 * hard: 1일, confuse: 3일, easy: 5일 시스템을 위한 데이터
 */
@Getter
@Builder
public class StudyCycleDashboardDto {
    
    // 카드 그룹들
    private final List<StudyCardInfo> todayCards;        // 오늘 학습해야 할 카드들
    private final List<StudyCardInfo> overdueCards;     // 지나간 카드들 (2~3일 지남)
    private final List<StudyCardInfo> yesterdayCards;   // 1일 지난 카드들
    private final List<StudyCardInfo> tomorrowCards;    // 내일 학습해야 할 카드들
    private final List<StudyCardInfo> within3DaysCards; // 3일 이내 카드들
    private final List<StudyCardInfo> within5DaysCards; // 5일 이내 카드들
    
    // 통계 정보
    private final StudyStats stats;
    
    // 권장 사항
    private final String recommendation;
    private final boolean hasStudyToday;               // 오늘 학습하기 버튼 표시 여부
    
    @Getter
    @Builder
    public static class StudyCardInfo {
        private final Long cardId;
        private final String content;           // 카드 내용 (요약)
        private final String deckName;          // 덱 이름
        private final String deckId;            // 덱 ID
        private final LocalDateTime dueAt;      // 복습 예정일
        private final Integer difficulty;       // 마지막 난이도 (1: hard, 3: confuse, 5: easy)
        private final Integer totalReviews;     // 총 복습 횟수
        private final String status;            // 상태 (overdue, today, upcoming 등)
        private final Integer daysOverdue;      // 지연 일수 (음수면 미래)
    }
    
    @Getter
    @Builder
    public static class StudyStats {
        private final int todayCount;
        private final int overdueCount;
        private final int yesterdayCount;
        private final int tomorrowCount;
        private final int within3DaysCount;
        private final int within5DaysCount;
        private final int totalActiveCards;
        private final int completedTodayCount;  // 오늘 완료한 카드 수
    }
} 