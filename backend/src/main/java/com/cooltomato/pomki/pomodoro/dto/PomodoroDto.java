package com.cooltomato.pomki.pomodoro.dto;

import com.cooltomato.pomki.pomodoro.entity.PomodoroSession;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class PomodoroDto {

    @Getter
    @Setter
    public static class CreateRequest {
        
        @NotNull(message = "세션 타입은 필수입니다")
        private PomodoroSession.SessionType sessionType;
        
        @NotNull(message = "계획 시간은 필수입니다")
        @Positive(message = "계획 시간은 양수여야 합니다")
        private Integer plannedDuration;
        
        @Size(max = 200, message = "세션 목표는 200자 이하여야 합니다")
        private String sessionGoal;
    }

    @Getter
    @Setter
    public static class UpdateNotesRequest {
        
        @Size(max = 10000, message = "세션 노트는 10000자 이하여야 합니다")
        private String sessionNotes;
    }

    @Getter
    @Setter
    public static class CompleteRequest {
        
        @NotNull(message = "실제 진행 시간은 필수입니다")
        @Positive(message = "실제 진행 시간은 양수여야 합니다")
        private Integer actualDuration;
        
        @Size(max = 10000, message = "세션 노트는 10000자 이하여야 합니다")
        private String sessionNotes;
        
        private Boolean generateAiSummary = false; // AI 요약 생성 여부
    }

    @Getter
    @Builder
    public static class Response {
        
        private String sessionId;
        private Long memberId;
        private PomodoroSession.SessionType sessionType;
        private Integer plannedDuration;
        private Integer actualDuration;
        private PomodoroSession.SessionStatus sessionStatus;
        private String sessionNotes;
        private String aiSummary;
        private String sessionGoal;
        private Boolean isCompleted;
        private LocalDateTime startedAt;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(PomodoroSession session) {
            return Response.builder()
                    .sessionId(session.getSessionId())
                    .memberId(session.getMemberId())
                    .sessionType(session.getSessionType())
                    .plannedDuration(session.getPlannedDuration())
                    .actualDuration(session.getActualDuration())
                    .sessionStatus(session.getSessionStatus())
                    .sessionNotes(session.getSessionNotes())
                    .aiSummary(session.getAiSummary())
                    .sessionGoal(session.getSessionGoal())
                    .isCompleted(session.getIsCompleted())
                    .startedAt(session.getStartedAt())
                    .completedAt(session.getCompletedAt())
                    .createdAt(session.getCreatedAt())
                    .updatedAt(session.getUpdatedAt())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class SessionStats {
        
        private Long totalSessions;
        private Long completedSessions;
        private Long totalFocusTime; // 분 단위
        private Long totalBreakTime; // 분 단위
        private Double completionRate;
        private Long todaySessions;
        private Long todayFocusTime;
        
        public static SessionStats empty() {
            return SessionStats.builder()
                    .totalSessions(0L)
                    .completedSessions(0L)
                    .totalFocusTime(0L)
                    .totalBreakTime(0L)
                    .completionRate(0.0)
                    .todaySessions(0L)
                    .todayFocusTime(0L)
                    .build();
        }
    }

    @Getter
    @Builder
    public static class TimerStateResponse {
        
        private String sessionId;
        private PomodoroSession.SessionStatus status;
        private PomodoroSession.SessionType sessionType;
        private Integer plannedDuration;
        private Integer remainingTime; // 남은 시간 (초)
        private LocalDateTime startedAt;
        private String sessionGoal;
        private Boolean canAddNotes;
        
        public static TimerStateResponse from(PomodoroSession session, Integer remainingTime) {
            return TimerStateResponse.builder()
                    .sessionId(session.getSessionId())
                    .status(session.getSessionStatus())
                    .sessionType(session.getSessionType())
                    .plannedDuration(session.getPlannedDuration())
                    .remainingTime(remainingTime)
                    .startedAt(session.getStartedAt())
                    .sessionGoal(session.getSessionGoal())
                    .canAddNotes(session.getSessionType() == PomodoroSession.SessionType.FOCUS)
                    .build();
        }
    }
} 