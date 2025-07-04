package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * @deprecated 이 컨트롤러는 레거시 방식을 사용합니다.
 * 새로운 통계 기능은 StatsController를 사용하세요.
 * 
 * 마이그레이션 가이드:
 * - POST /api/study-logs/note-created → POST /api/stats/attendance (출석은 자동 기록)
 * - POST /api/study-logs/card-reviewed → ReviewController의 기존 API 사용
 * - 새로운 구조화된 통계는 GET /api/stats/summary 사용
 */
@Deprecated
@RestController
@RequestMapping("/api/study-logs")
@RequiredArgsConstructor
@Slf4j
public class StudyLogController {

    private final StudyLogService studyLogService;

    /**
     * @deprecated 사용하지 마세요. 새로운 출석 시스템: POST /api/stats/attendance
     */
    @Deprecated
    @PostMapping("/note-created")
    public ResponseEntity<Void> recordNoteCreation(
            @RequestBody NoteActivityRequest request,
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.warn("DEPRECATED API 사용: /api/study-logs/note-created - 새로운 API로 마이그레이션하세요");
        
        Map<String, Object> details = Map.of(
                "note_title", request.getNoteTitle(),
                "note_length", request.getNoteLength(),
                "duration_minutes", request.getDurationMinutes() != null ? request.getDurationMinutes() : 0
        );

        studyLogService.recordActivity(
                principal.getMemberInfo().getMemberId(),
                "NOTE_CREATED",
                details
        );

        return ResponseEntity.ok().build();
    }

    /**
     * @deprecated 사용하지 마세요. ReviewController의 기존 API를 사용하세요.
     */
    @Deprecated
    @PostMapping("/card-reviewed")
    public ResponseEntity<Void> recordCardReview(
            @RequestBody CardReviewRequest request,
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.warn("DEPRECATED API 사용: /api/study-logs/card-reviewed - ReviewController API로 마이그레이션하세요");
        
        Map<String, Object> details = Map.of(
                "card_count", request.getCardCount(),
                "difficulty", request.getDifficulty(),
                "duration_minutes", request.getDurationMinutes() != null ? request.getDurationMinutes() : 0
        );

        studyLogService.recordActivity(
                principal.getMemberInfo().getMemberId(),
                "CARD_REVIEWED",
                details
        );

        return ResponseEntity.ok().build();
    }

    /**
     * @deprecated 사용하지 마세요. 새로운 포모도로 시스템을 구현하세요.
     */
    @Deprecated
    @PostMapping("/pomodoro-completed")
    public ResponseEntity<Void> recordPomodoroCompletion(
            @RequestBody PomodoroActivityRequest request,
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.warn("DEPRECATED API 사용: /api/study-logs/pomodoro-completed - 새로운 포모도로 API가 필요합니다");
        
        Map<String, Object> details = Map.of(
                "goal_minutes", request.getGoalMinutes(),
                "actual_minutes", request.getActualMinutes(),
                "pomodoro_completed", request.getPomodoroCompleted(),
                "pomodoro_total", request.getPomodoroTotal()
        );

        studyLogService.recordActivity(
                principal.getMemberInfo().getMemberId(),
                "POMODORO_SESSION_COMPLETED",
                details
        );

        return ResponseEntity.ok().build();
    }

    // Request DTOs (레거시)
    public static class NoteActivityRequest {
        private String noteTitle;
        private Integer noteLength;
        private Integer durationMinutes;

        // Getters and Setters
        public String getNoteTitle() { return noteTitle; }
        public void setNoteTitle(String noteTitle) { this.noteTitle = noteTitle; }
        
        public Integer getNoteLength() { return noteLength; }
        public void setNoteLength(Integer noteLength) { this.noteLength = noteLength; }
        
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    }

    public static class CardReviewRequest {
        private Integer cardCount;
        private String difficulty;
        private Integer durationMinutes;

        // Getters and Setters
        public Integer getCardCount() { return cardCount; }
        public void setCardCount(Integer cardCount) { this.cardCount = cardCount; }
        
        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
        
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    }

    public static class PomodoroActivityRequest {
        private Integer goalMinutes;
        private Integer actualMinutes;
        private Integer pomodoroCompleted;
        private Integer pomodoroTotal;

        // Getters and Setters
        public Integer getGoalMinutes() { return goalMinutes; }
        public void setGoalMinutes(Integer goalMinutes) { this.goalMinutes = goalMinutes; }
        
        public Integer getActualMinutes() { return actualMinutes; }
        public void setActualMinutes(Integer actualMinutes) { this.actualMinutes = actualMinutes; }
        
        public Integer getPomodoroCompleted() { return pomodoroCompleted; }
        public void setPomodoroCompleted(Integer pomodoroCompleted) { this.pomodoroCompleted = pomodoroCompleted; }
        
        public Integer getPomodoroTotal() { return pomodoroTotal; }
        public void setPomodoroTotal(Integer pomodoroTotal) { this.pomodoroTotal = pomodoroTotal; }
    }
} 