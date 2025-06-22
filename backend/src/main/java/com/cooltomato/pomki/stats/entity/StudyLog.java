package com.cooltomato.pomki.stats.entity;

import com.cooltomato.pomki.member.entity.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "STUDY_LOG")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StudyLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false, length = 50)
    private String activityType;

    @Column(columnDefinition = "json")
    private String activityDetails;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public StudyLog(Member member, String activityType, String activityDetails) {
        this.member = member;
        this.activityType = activityType;
        this.activityDetails = activityDetails;
    }
}


// package com.cooltomato.pomki.stats.entity;

// import jakarta.persistence.*;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;
// import org.hibernate.annotations.CreationTimestamp;

// import java.time.LocalDateTime;

// @Entity
// @Table(name = "study_session")
// @Getter
// @Setter
// @NoArgsConstructor
// public class StudyLog {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     @Column(name = "session_id")
//     private Long sessionId;

//     @Column(name = "member_id", nullable = false)
//     private Long memberId;

//     @Column(name = "activity_type", nullable = false)
//     @Enumerated(EnumType.STRING)
//     private ActivityType activityType;

//     @Column(name = "activity_title")
//     private String activityTitle;

//     @Column(name = "study_minutes", nullable = false)
//     private Integer studyMinutes = 0;

//     @Column(name = "goal_minutes", nullable = false)
//     private Integer goalMinutes = 240;

//     @Column(name = "pomodoro_completed", nullable = false)
//     private Integer pomodoroCompleted = 0;

//     @Column(name = "pomodoro_total", nullable = false)
//     private Integer pomodoroTotal = 8;

//     @CreationTimestamp
//     @Column(name = "created_at", nullable = false)
//     private LocalDateTime createdAt;

//     public enum ActivityType {
//         NOTE_CREATED("노트 작성"),
//         CARD_STUDIED("플래시카드 복습"),
//         VOCABULARY_STUDY("단어 암기"),
//         AI_POLISHING("AI 노트 정리"),
//         AI_QUIZEGEN("AI 퀴즈 생성");

//         private final String description;

//         ActivityType(String description) {
//             this.description = description;
//         }

//         public String getDescription() {
//             return description;
//         }
//     }

//     @Builder
//     public StudyLog(Long memberId, ActivityType activityType, String activityTitle,
//                        Integer studyMinutes, Integer goalMinutes,
//                        Integer pomodoroCompleted, Integer pomodoroTotal) {
//         this.memberId = memberId;
//         this.activityType = activityType;
//         this.activityTitle = activityTitle;
//         this.studyMinutes = studyMinutes != null ? studyMinutes : 0;
//         this.goalMinutes = goalMinutes != null ? goalMinutes : 240;
//         this.pomodoroCompleted = pomodoroCompleted != null ? pomodoroCompleted : 0;
//         this.pomodoroTotal = pomodoroTotal != null ? pomodoroTotal : 8;
//     }
// } 