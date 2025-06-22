package com.cooltomato.pomki.pomodoro.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "POMODORO_SESSION")
@Getter
@Setter
@NoArgsConstructor
public class PomodoroSession {

    @Id
    @UuidGenerator
    @Column(name = "session_id", length = 50)
    private String sessionId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "session_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private SessionType sessionType;

    @Column(name = "planned_duration", nullable = false)
    private Integer plannedDuration; // 계획된 시간 (분)

    @Column(name = "actual_duration")
    private Integer actualDuration; // 실제 진행 시간 (분)

    @Column(name = "session_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private SessionStatus sessionStatus;

    @Lob
    @Column(name = "session_notes", columnDefinition = "LONGTEXT")
    private String sessionNotes; // 세션 중 작성한 메모

    @Lob
    @Column(name = "ai_summary", columnDefinition = "LONGTEXT")
    private String aiSummary; // AI가 생성한 요약

    @Column(name = "session_goal")
    private String sessionGoal; // 세션 목표

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public PomodoroSession(Long memberId, SessionType sessionType, Integer plannedDuration, 
                          String sessionGoal, SessionStatus sessionStatus) {
        this.memberId = memberId;
        this.sessionType = sessionType;
        this.plannedDuration = plannedDuration;
        this.sessionGoal = sessionGoal;
        this.sessionStatus = sessionStatus != null ? sessionStatus : SessionStatus.READY;
        this.isCompleted = false;
    }

    public enum SessionType {
        FOCUS("집중 세션"),
        SHORT_BREAK("짧은 휴식"),
        LONG_BREAK("긴 휴식");

        private final String description;

        SessionType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public enum SessionStatus {
        READY("준비"),
        RUNNING("진행중"),
        PAUSED("일시정지"),
        COMPLETED("완료"),
        CANCELLED("취소");

        private final String description;

        SessionStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
} 