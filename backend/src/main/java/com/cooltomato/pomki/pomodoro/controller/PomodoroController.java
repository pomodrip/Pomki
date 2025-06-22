package com.cooltomato.pomki.pomodoro.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.pomodoro.dto.PomodoroDto;
import com.cooltomato.pomki.pomodoro.service.PomodoroService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Optional;

@RestController
@RequestMapping("/api/pomodoro")
@RequiredArgsConstructor
@Slf4j
public class PomodoroController {

    private final PomodoroService pomodoroService;

    /**
     * 새로운 포모도로 세션 생성
     */
    @PostMapping("/sessions")
    public ResponseEntity<PomodoroDto.Response> createSession(
            @Valid @RequestBody PomodoroDto.CreateRequest request,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.Response response = pomodoroService.createSession(
                principalMember.getMemberId(), request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 세션 시작
     */
    @PostMapping("/sessions/{sessionId}/start")
    public ResponseEntity<PomodoroDto.Response> startSession(
            @PathVariable String sessionId,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.Response response = pomodoroService.startSession(
                principalMember.getMemberId(), sessionId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 세션 일시정지
     */
    @PostMapping("/sessions/{sessionId}/pause")
    public ResponseEntity<PomodoroDto.Response> pauseSession(
            @PathVariable String sessionId,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.Response response = pomodoroService.pauseSession(
                principalMember.getMemberId(), sessionId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 세션 완료
     */
    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<PomodoroDto.Response> completeSession(
            @PathVariable String sessionId,
            @Valid @RequestBody PomodoroDto.CompleteRequest request,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.Response response = pomodoroService.completeSession(
                principalMember.getMemberId(), sessionId, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 세션 취소
     */
    @PostMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<PomodoroDto.Response> cancelSession(
            @PathVariable String sessionId,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.Response response = pomodoroService.cancelSession(
                principalMember.getMemberId(), sessionId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 세션 노트 업데이트 (실시간 메모 작성)
     */
    @PutMapping("/sessions/{sessionId}/notes")
    public ResponseEntity<PomodoroDto.Response> updateSessionNotes(
            @PathVariable String sessionId,
            @Valid @RequestBody PomodoroDto.UpdateNotesRequest request,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.Response response = pomodoroService.updateSessionNotes(
                principalMember.getMemberId(), sessionId, request);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 현재 진행 중인 세션 상태 조회
     */
    @GetMapping("/current")
    public ResponseEntity<PomodoroDto.TimerStateResponse> getCurrentSession(
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        Optional<PomodoroDto.TimerStateResponse> currentSession = 
                pomodoroService.getCurrentSession(principalMember.getMemberId());
        
        return currentSession
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    /**
     * 세션 목록 조회
     */
    @GetMapping("/sessions")
    public ResponseEntity<Page<PomodoroDto.Response>> getSessions(
            @PageableDefault(size = 20) Pageable pageable,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        Page<PomodoroDto.Response> sessions = pomodoroService.getSessions(
                principalMember.getMemberId(), pageable);
        
        return ResponseEntity.ok(sessions);
    }

    /**
     * 포모도로 통계 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<PomodoroDto.SessionStats> getSessionStats(
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.SessionStats stats = pomodoroService.getSessionStats(
                principalMember.getMemberId());
        
        return ResponseEntity.ok(stats);
    }

    /**
     * 세션에서 노트 자동 생성 (AI 연동)
     */
    @PostMapping("/sessions/{sessionId}/generate-note")
    public ResponseEntity<Object> generateNoteFromSession(
            @PathVariable String sessionId,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        try {
            String noteId = pomodoroService.generateNoteFromSession(
                    principalMember.getMemberId(), sessionId);
            
            String generatedNoteId = noteId;
            return ResponseEntity.ok(new Object() {
                public final String noteId = generatedNoteId;
                public final boolean success = true;
                public final String message = "포모도로 세션에서 노트가 생성되었습니다";
            });
            
        } catch (Exception e) {
            log.error("Failed to generate note from session: {}", sessionId, e);
            return ResponseEntity.badRequest().body(new Object() {
                public final boolean success = false;
                public final String message = e.getMessage();
            });
        }
    }

    /**
     * 빠른 포모도로 시작 (기본 25분 집중 세션)
     */
    @PostMapping("/quick-start")
    public ResponseEntity<PomodoroDto.Response> quickStart(
            @RequestParam(defaultValue = "25") Integer duration,
            @RequestParam(defaultValue = "집중 세션") String goal,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        PomodoroDto.CreateRequest request = new PomodoroDto.CreateRequest();
        request.setSessionType(com.cooltomato.pomki.pomodoro.entity.PomodoroSession.SessionType.FOCUS);
        request.setPlannedDuration(duration);
        request.setSessionGoal(goal);
        
        PomodoroDto.Response session = pomodoroService.createSession(
                principalMember.getMemberId(), request);
        
        // 바로 시작
        PomodoroDto.Response startedSession = pomodoroService.startSession(
                principalMember.getMemberId(), session.getSessionId());
        
        return ResponseEntity.ok(startedSession);
    }

    /**
     * 포모도로 사이클 권장 (25분 집중 → 5분 휴식 → 25분 집중 → 15분 긴 휴식)
     */
    @GetMapping("/cycle-suggestion")
    public ResponseEntity<Object> getCycleSuggestion(
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        // 오늘의 세션 통계를 기반으로 다음 권장 세션 타입 결정
        PomodoroDto.SessionStats stats = pomodoroService.getSessionStats(principalMember.getMemberId());
        
        String nextSessionType;
        Integer nextDuration;
        String suggestion;
        
        long todayFocusSession = stats.getTodaySessions() > 0 ? 
                stats.getTodaySessions() : 0;
        
        if (todayFocusSession % 4 == 3) {
            // 4번째 사이클 후 긴 휴식
            nextSessionType = "LONG_BREAK";
            nextDuration = 15;
            suggestion = "4번의 집중 세션을 완료했습니다! 15분 긴 휴식을 권장합니다.";
        } else if (todayFocusSession % 2 == 1) {
            // 집중 세션 후 짧은 휴식
            nextSessionType = "SHORT_BREAK";
            nextDuration = 5;
            suggestion = "집중 세션을 완료했습니다! 5분 짧은 휴식을 권장합니다.";
        } else {
            // 일반적인 집중 세션
            nextSessionType = "FOCUS";
            nextDuration = 25;
            suggestion = "새로운 집중 세션을 시작하세요! 25분 집중을 권장합니다.";
        }
        
        return ResponseEntity.ok(new Object() {
            public final String recommendedType = nextSessionType;
            public final Integer recommendedDuration = nextDuration;
            public final String message = suggestion;
            public final Long todayCompletedSessions = stats.getTodaySessions();
            public final Long todayFocusTime = stats.getTodayFocusTime();
        });
    }
} 