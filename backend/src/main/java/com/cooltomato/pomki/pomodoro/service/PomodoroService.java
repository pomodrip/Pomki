package com.cooltomato.pomki.pomodoro.service;

import com.cooltomato.pomki.ai.service.AIService;
import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.pomodoro.dto.PomodoroDto;
import com.cooltomato.pomki.pomodoro.entity.PomodoroSession;
import com.cooltomato.pomki.pomodoro.repository.PomodoroSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PomodoroService {

    private final PomodoroSessionRepository sessionRepository;
    private final AIService aiService;
    private final NoteRepository noteRepository;

    /**
     * 새로운 포모도로 세션 생성
     */
    public PomodoroDto.Response createSession(Long memberId, PomodoroDto.CreateRequest request) {
        // 활성 세션이 있는지 확인
        List<PomodoroSession.SessionStatus> activeStatuses = Arrays.asList(
                PomodoroSession.SessionStatus.RUNNING,
                PomodoroSession.SessionStatus.PAUSED
        );
        
        Optional<PomodoroSession> activeSession = sessionRepository
                .findByMemberIdAndSessionStatusIn(memberId, activeStatuses);
        
        if (activeSession.isPresent()) {
            throw new BadRequestException("이미 진행 중인 세션이 있습니다. 현재 세션을 완료하거나 취소한 후 새 세션을 시작하세요.");
        }

        PomodoroSession session = PomodoroSession.builder()
                .memberId(memberId)
                .sessionType(request.getSessionType())
                .plannedDuration(request.getPlannedDuration())
                .sessionGoal(request.getSessionGoal())
                .sessionStatus(PomodoroSession.SessionStatus.READY)
                .build();

        PomodoroSession savedSession = sessionRepository.save(session);
        log.info("새 포모도로 세션 생성 - memberId: {}, sessionId: {}, type: {}", 
                memberId, savedSession.getSessionId(), savedSession.getSessionType());

        return PomodoroDto.Response.from(savedSession);
    }

    /**
     * 세션 시작
     */
    public PomodoroDto.Response startSession(Long memberId, String sessionId) {
        PomodoroSession session = getSessionByIdAndMemberId(sessionId, memberId);
        
        if (session.getSessionStatus() != PomodoroSession.SessionStatus.READY &&
            session.getSessionStatus() != PomodoroSession.SessionStatus.PAUSED) {
            throw new BadRequestException("시작할 수 없는 세션 상태입니다: " + session.getSessionStatus());
        }

        session.setSessionStatus(PomodoroSession.SessionStatus.RUNNING);
        if (session.getStartedAt() == null) {
            session.setStartedAt(LocalDateTime.now());
        }

        PomodoroSession savedSession = sessionRepository.save(session);
        log.info("포모도로 세션 시작 - sessionId: {}, memberId: {}", sessionId, memberId);

        return PomodoroDto.Response.from(savedSession);
    }

    /**
     * 세션 일시정지
     */
    public PomodoroDto.Response pauseSession(Long memberId, String sessionId) {
        PomodoroSession session = getSessionByIdAndMemberId(sessionId, memberId);
        
        if (session.getSessionStatus() != PomodoroSession.SessionStatus.RUNNING) {
            throw new BadRequestException("실행 중인 세션만 일시정지할 수 있습니다.");
        }

        session.setSessionStatus(PomodoroSession.SessionStatus.PAUSED);
        PomodoroSession savedSession = sessionRepository.save(session);
        
        log.info("포모도로 세션 일시정지 - sessionId: {}, memberId: {}", sessionId, memberId);
        return PomodoroDto.Response.from(savedSession);
    }

    /**
     * 세션 완료
     */
    public PomodoroDto.Response completeSession(Long memberId, String sessionId, PomodoroDto.CompleteRequest request) {
        PomodoroSession session = getSessionByIdAndMemberId(sessionId, memberId);
        
        if (session.getSessionStatus() == PomodoroSession.SessionStatus.COMPLETED) {
            throw new BadRequestException("이미 완료된 세션입니다.");
        }

        session.setSessionStatus(PomodoroSession.SessionStatus.COMPLETED);
        session.setActualDuration(request.getActualDuration());
        session.setSessionNotes(request.getSessionNotes());
        session.setIsCompleted(true);
        session.setCompletedAt(LocalDateTime.now());

        // AI 요약 생성 (집중 세션이고 노트가 있으며 요청한 경우)
        if (request.getGenerateAiSummary() && 
            session.getSessionType() == PomodoroSession.SessionType.FOCUS &&
            request.getSessionNotes() != null && !request.getSessionNotes().trim().isEmpty()) {
            
            try {
                String aiSummary = aiService.polishNote(request.getSessionNotes(), "summary");
                session.setAiSummary(aiSummary);
                log.info("AI 요약 생성 완료 - sessionId: {}", sessionId);
            } catch (Exception e) {
                log.warn("AI 요약 생성 실패 - sessionId: {}, error: {}", sessionId, e.getMessage());
                // AI 실패는 세션 완료를 막지 않음
            }
        }

        PomodoroSession savedSession = sessionRepository.save(session);
        log.info("포모도로 세션 완료 - sessionId: {}, memberId: {}, 실제시간: {}분", 
                sessionId, memberId, request.getActualDuration());

        return PomodoroDto.Response.from(savedSession);
    }

    /**
     * 세션 취소
     */
    public PomodoroDto.Response cancelSession(Long memberId, String sessionId) {
        PomodoroSession session = getSessionByIdAndMemberId(sessionId, memberId);
        
        if (session.getSessionStatus() == PomodoroSession.SessionStatus.COMPLETED) {
            throw new BadRequestException("완료된 세션은 취소할 수 없습니다.");
        }

        session.setSessionStatus(PomodoroSession.SessionStatus.CANCELLED);
        PomodoroSession savedSession = sessionRepository.save(session);
        
        log.info("포모도로 세션 취소 - sessionId: {}, memberId: {}", sessionId, memberId);
        return PomodoroDto.Response.from(savedSession);
    }

    /**
     * 세션 노트 업데이트 (진행 중에만 가능)
     */
    public PomodoroDto.Response updateSessionNotes(Long memberId, String sessionId, PomodoroDto.UpdateNotesRequest request) {
        PomodoroSession session = getSessionByIdAndMemberId(sessionId, memberId);
        
        if (session.getSessionStatus() != PomodoroSession.SessionStatus.RUNNING &&
            session.getSessionStatus() != PomodoroSession.SessionStatus.PAUSED) {
            throw new BadRequestException("진행 중이거나 일시정지된 세션에서만 노트를 수정할 수 있습니다.");
        }

        session.setSessionNotes(request.getSessionNotes());
        PomodoroSession savedSession = sessionRepository.save(session);
        
        log.debug("세션 노트 업데이트 - sessionId: {}, memberId: {}", sessionId, memberId);
        return PomodoroDto.Response.from(savedSession);
    }

    /**
     * 현재 활성 세션 조회
     */
    @Transactional(readOnly = true)
    public Optional<PomodoroDto.TimerStateResponse> getCurrentSession(Long memberId) {
        List<PomodoroSession.SessionStatus> activeStatuses = Arrays.asList(
                PomodoroSession.SessionStatus.READY,
                PomodoroSession.SessionStatus.RUNNING,
                PomodoroSession.SessionStatus.PAUSED
        );
        
        Optional<PomodoroSession> activeSession = sessionRepository
                .findByMemberIdAndSessionStatusIn(memberId, activeStatuses);
        
        if (activeSession.isEmpty()) {
            return Optional.empty();
        }

        PomodoroSession session = activeSession.get();
        int remainingTime = calculateRemainingTime(session);
        
        return Optional.of(PomodoroDto.TimerStateResponse.from(session, remainingTime));
    }

    /**
     * 세션 목록 조회
     */
    @Transactional(readOnly = true)
    public Page<PomodoroDto.Response> getSessions(Long memberId, Pageable pageable) {
        Page<PomodoroSession> sessions = sessionRepository.findByMemberIdOrderByCreatedAtDesc(memberId, pageable);
        return sessions.map(PomodoroDto.Response::from);
    }

    /**
     * 세션 통계 조회
     */
    @Transactional(readOnly = true)
    public PomodoroDto.SessionStats getSessionStats(Long memberId) {
        long totalSessions = sessionRepository.countByMemberId(memberId);
        long completedSessions = sessionRepository.countByMemberIdAndIsCompletedTrue(memberId);
        Long totalFocusTime = sessionRepository.getTotalFocusTimeByMemberId(memberId);
        Long totalBreakTime = sessionRepository.getTotalBreakTimeByMemberId(memberId);
        Long todayFocusTime = sessionRepository.getTodayFocusTimeByMemberId(memberId);
        List<PomodoroSession> todaySessions = sessionRepository.findTodaySessionsByMemberId(memberId);

        double completionRate = totalSessions > 0 ? (double) completedSessions / totalSessions * 100 : 0.0;

        return PomodoroDto.SessionStats.builder()
                .totalSessions(totalSessions)
                .completedSessions(completedSessions)
                .totalFocusTime(totalFocusTime != null ? totalFocusTime : 0L)
                .totalBreakTime(totalBreakTime != null ? totalBreakTime : 0L)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .todaySessions((long) todaySessions.size())
                .todayFocusTime(todayFocusTime != null ? todayFocusTime : 0L)
                .build();
    }

    /**
     * AI 요약으로 노트 자동 생성
     */
    public String generateNoteFromSession(Long memberId, String sessionId) {
        PomodoroSession session = getSessionByIdAndMemberId(sessionId, memberId);
        
        if (session.getAiSummary() == null || session.getAiSummary().trim().isEmpty()) {
            throw new BadRequestException("AI 요약이 없는 세션입니다.");
        }

        // AI 요약을 기반으로 노트 생성
        String noteTitle = "포모도로 세션 - " + session.getSessionGoal() + " (" + 
                          session.getCompletedAt().toLocalDate() + ")";
        
        String noteContent = "🍅 포모도로 세션 요약\n\n" +
                           "📅 날짜: " + session.getCompletedAt().toLocalDate() + "\n" +
                           "⏰ 시간: " + session.getActualDuration() + "분\n" +
                           "🎯 목표: " + session.getSessionGoal() + "\n\n" +
                           "📝 AI 요약:\n" + session.getAiSummary();

        Note note = Note.builder()
                .memberId(memberId)
                .noteTitle(noteTitle)
                .noteContent(noteContent)
                .originalContent(session.getSessionNotes())
                .aiEnhanced(true)
                .isDeleted(false)
                .build();

        Note savedNote = noteRepository.save(note);
        log.info("포모도로 세션에서 노트 생성 - sessionId: {}, noteId: {}", sessionId, savedNote.getNoteId());
        
        return savedNote.getNoteId();
    }

    // === 헬퍼 메서드들 ===

    private PomodoroSession getSessionByIdAndMemberId(String sessionId, Long memberId) {
        return sessionRepository.findById(sessionId)
                .filter(session -> session.getMemberId().equals(memberId))
                .orElseThrow(() -> new NotFoundException("세션을 찾을 수 없습니다."));
    }

    private int calculateRemainingTime(PomodoroSession session) {
        if (session.getSessionStatus() != PomodoroSession.SessionStatus.RUNNING || 
            session.getStartedAt() == null) {
            return session.getPlannedDuration() * 60; // 전체 시간 (초)
        }

        long elapsedSeconds = Duration.between(session.getStartedAt(), LocalDateTime.now()).getSeconds();
        long totalSeconds = session.getPlannedDuration() * 60L;
        
        return Math.max(0, (int) (totalSeconds - elapsedSeconds));
    }
} 