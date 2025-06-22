package com.cooltomato.pomki.pomodoro.repository;

import com.cooltomato.pomki.pomodoro.entity.PomodoroSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, String> {
    
    // 특정 사용자의 활성 세션 조회 (진행중이거나 일시정지된 세션)
    Optional<PomodoroSession> findByMemberIdAndSessionStatusIn(
            Long memberId, List<PomodoroSession.SessionStatus> statuses);
    
    // 특정 사용자의 세션 목록 조회 (페이지네이션)
    Page<PomodoroSession> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);
    
    // 특정 사용자의 완료된 세션 수
    long countByMemberIdAndIsCompletedTrue(Long memberId);
    
    // 특정 사용자의 전체 세션 수
    long countByMemberId(Long memberId);
    
    // 특정 기간 동안의 세션들 조회
    List<PomodoroSession> findByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long memberId, LocalDateTime startDate, LocalDateTime endDate);
    
    // 오늘의 세션들 조회
    @Query("SELECT ps FROM PomodoroSession ps WHERE ps.memberId = :memberId " +
           "AND DATE(ps.createdAt) = CURRENT_DATE " +
           "ORDER BY ps.createdAt DESC")
    List<PomodoroSession> findTodaySessionsByMemberId(@Param("memberId") Long memberId);
    
    // 특정 사용자의 집중 세션 통계
    @Query("SELECT SUM(ps.actualDuration) FROM PomodoroSession ps " +
           "WHERE ps.memberId = :memberId AND ps.sessionType = 'FOCUS' " +
           "AND ps.isCompleted = true")
    Long getTotalFocusTimeByMemberId(@Param("memberId") Long memberId);
    
    // 특정 사용자의 휴식 시간 통계
    @Query("SELECT SUM(ps.actualDuration) FROM PomodoroSession ps " +
           "WHERE ps.memberId = :memberId AND ps.sessionType IN ('SHORT_BREAK', 'LONG_BREAK') " +
           "AND ps.isCompleted = true")
    Long getTotalBreakTimeByMemberId(@Param("memberId") Long memberId);
    
    // 오늘의 집중 시간
    @Query("SELECT SUM(ps.actualDuration) FROM PomodoroSession ps " +
           "WHERE ps.memberId = :memberId AND ps.sessionType = 'FOCUS' " +
           "AND ps.isCompleted = true AND DATE(ps.completedAt) = CURRENT_DATE")
    Long getTodayFocusTimeByMemberId(@Param("memberId") Long memberId);
    
    // 최근 AI 요약이 생성된 세션들 조회 (노트 생성용)
    @Query("SELECT ps FROM PomodoroSession ps WHERE ps.memberId = :memberId " +
           "AND ps.aiSummary IS NOT NULL AND ps.aiSummary != '' " +
           "AND ps.sessionType = 'FOCUS' " +
           "ORDER BY ps.completedAt DESC")
    List<PomodoroSession> findRecentSessionsWithAiSummary(@Param("memberId") Long memberId, Pageable pageable);
} 