package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@Tag(name = "Study Log", description = "학습 활동 기록 API")
@RestController
@RequestMapping("/api/study-logs")
@RequiredArgsConstructor
@Slf4j
public class StudyLogController {

    private final StudyLogService studyLogService;

    @Operation(summary = "포모도로 세션 기록", description = "포모도로 세션 완료 시 학습 활동을 기록합니다.")
    @PostMapping("/pomodoro")
    public ResponseEntity<Void> recordPomodoroSession(
            @RequestBody PomodoroSessionRequest request,
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.info("Recording pomodoro session for member: {}", principal.getMemberInfo().getMemberId());
        
        Map<String, Object> details = Map.of(
                "duration_minutes", request.getDurationMinutes(),
                "task_title", request.getTaskTitle() != null ? request.getTaskTitle() : "포모도로 세션",
                "completed", request.isCompleted()
        );

        studyLogService.recordActivity(
                principal.getMemberInfo().getMemberId(),
                "POMODORO_SESSION_COMPLETED",
                details
        );

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "노트 생성 기록", description = "노트 생성 시 학습 활동을 기록합니다.")
    @PostMapping("/note-created")
    public ResponseEntity<Void> recordNoteCreation(
            @RequestBody NoteActivityRequest request,
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.info("Recording note creation for member: {}", principal.getMemberInfo().getMemberId());
        
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

    @Operation(summary = "카드 복습 기록", description = "카드 복습 시 학습 활동을 기록합니다.")
    @PostMapping("/card-reviewed")
    public ResponseEntity<Void> recordCardReview(
            @RequestBody CardReviewRequest request,
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.info("Recording card review for member: {}", principal.getMemberInfo().getMemberId());
        
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

    // Request DTOs
    public static class PomodoroSessionRequest {
        private Integer durationMinutes;
        private String taskTitle;
        private boolean completed;

        // Getters and Setters
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        
        public String getTaskTitle() { return taskTitle; }
        public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
        
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

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
} 