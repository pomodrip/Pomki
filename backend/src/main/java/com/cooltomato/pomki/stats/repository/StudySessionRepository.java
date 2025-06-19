package com.cooltomato.pomki.stats.repository;

import com.cooltomato.pomki.stats.entity.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    // 오늘의 활동 조회
    @Query("SELECT s FROM StudySession s WHERE s.memberId = :memberId AND s.createdAt >= :startOfDay AND s.createdAt < :endOfDay ORDER BY s.createdAt DESC")
    List<StudySession> getTodayActivities(@Param("memberId") Long memberId, 
                                        @Param("startOfDay") LocalDateTime startOfDay, 
                                        @Param("endOfDay") LocalDateTime endOfDay);

    // 최근 활동 조회
    @Query("SELECT s FROM StudySession s WHERE s.memberId = :memberId AND s.createdAt >= :fromDate ORDER BY s.createdAt DESC")
    List<StudySession> getRecentActivities(@Param("memberId") Long memberId, 
                                         @Param("fromDate") LocalDateTime fromDate);

    // 오늘 총 학습 시간
    @Query("SELECT COALESCE(SUM(s.studyMinutes), 0) FROM StudySession s WHERE s.memberId = :memberId AND s.createdAt >= :startOfDay AND s.createdAt < :endOfDay")
    Integer getTodayStudyMinutes(@Param("memberId") Long memberId, 
                               @Param("startOfDay") LocalDateTime startOfDay, 
                               @Param("endOfDay") LocalDateTime endOfDay);

    // 오늘 완료된 포모도로 수
    @Query("SELECT COALESCE(SUM(s.pomodoroCompleted), 0) FROM StudySession s WHERE s.memberId = :memberId AND s.createdAt >= :startOfDay AND s.createdAt < :endOfDay")
    Integer getTodayPomodoroCompleted(@Param("memberId") Long memberId, 
                                    @Param("startOfDay") LocalDateTime startOfDay, 
                                    @Param("endOfDay") LocalDateTime endOfDay);

    // 특정 회원의 모든 활동 수
    @Query("SELECT COUNT(s) FROM StudySession s WHERE s.memberId = :memberId")
    Long getTotalActivitiesCount(@Param("memberId") Long memberId);
} 