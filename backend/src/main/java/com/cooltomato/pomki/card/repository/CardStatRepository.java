package com.cooltomato.pomki.card.repository;

import com.cooltomato.pomki.card.entity.CardStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CardStatRepository extends JpaRepository<CardStat, Long> {
    
    // 특정 카드의 모든 복습 이력 조회 (시간순)
    List<CardStat> findByCardIdOrderByReviewTimestampDesc(Long cardId);
    
    // 특정 사용자의 특정 카드에 대한 최신 복습 기록 조회
    @Query("SELECT cs FROM CardStat cs WHERE cs.cardId = :cardId AND cs.memberId = :memberId " +
           "ORDER BY cs.reviewTimestamp DESC LIMIT 1")
    Optional<CardStat> findLatestReviewByCardAndMember(@Param("cardId") Long cardId, @Param("memberId") Long memberId);
    
    // 복습이 필요한 카드들의 통계 조회
    @Query("SELECT cs FROM CardStat cs WHERE cs.memberId = :memberId " +
           "AND cs.nextReviewAt <= :currentTime " +
           "ORDER BY cs.nextReviewAt ASC")
    List<CardStat> findCardsForReview(@Param("memberId") Long memberId, @Param("currentTime") LocalDateTime currentTime);
    
    // 특정 사용자의 오늘 복습한 카드 수
    @Query("SELECT COUNT(cs) FROM CardStat cs WHERE cs.memberId = :memberId " +
           "AND cs.reviewTimestamp >= :startOfDay AND cs.reviewTimestamp < :endOfDay")
    long countTodayReviews(@Param("memberId") Long memberId, 
                          @Param("startOfDay") LocalDateTime startOfDay, 
                          @Param("endOfDay") LocalDateTime endOfDay);
    
    // 특정 사용자의 전체 복습 횟수
    long countByMemberId(Long memberId);
    
    // 특정 기간 동안의 복습 성과 분석 (FSRS 알고리즘 개선용)
    @Query("SELECT cs FROM CardStat cs WHERE cs.memberId = :memberId " +
           "AND cs.reviewTimestamp >= :fromDate " +
           "ORDER BY cs.reviewTimestamp ASC")
    List<CardStat> findReviewHistoryForAnalysis(@Param("memberId") Long memberId, 
                                               @Param("fromDate") LocalDateTime fromDate);
    
    // 난이도별 카드 분포 (통계용)
    @Query("SELECT cs.difficulty, COUNT(cs) FROM CardStat cs " +
           "WHERE cs.memberId = :memberId " +
           "GROUP BY cs.difficulty")
    List<Object[]> getDifficultyDistribution(@Param("memberId") Long memberId);
} 