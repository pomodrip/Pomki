package com.cooltomato.pomki.card.repository;

import com.cooltomato.pomki.card.entity.CardStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CardStatRepository extends JpaRepository<CardStat, Long> {

    // 특정 사용자-카드 조합의 통계 조회
    Optional<CardStat> findByMemberMemberIdAndCardCardId(Long memberId, Long cardId);

    // 특정 사용자의 오늘 복습할 카드들 조회 (due_at 기준)
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt <= :now " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findDueCardsByMember(@Param("memberId") Long memberId, 
                                        @Param("now") LocalDateTime now);

    // 특정 사용자의 모든 카드 통계 조회
    List<CardStat> findByMemberMemberIdOrderByUpdatedAtDesc(Long memberId);

    // 특정 사용자의 복습 완료 카드 수 (오늘 기준)
    @Query("SELECT COUNT(cs) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.lastReviewedAt >= :startOfDay " +
           "AND cs.lastReviewedAt < :endOfDay")
    Long countTodayReviewedCards(@Param("memberId") Long memberId,
                                @Param("startOfDay") LocalDateTime startOfDay,
                                @Param("endOfDay") LocalDateTime endOfDay);

    // 특정 사용자의 총 복습 카드 수
    Long countByMemberMemberId(Long memberId);

    // 복습 예정인 카드 수 (특정 기간 내)
    @Query("SELECT COUNT(cs) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :startDate AND :endDate")
    Long countDueCardsInPeriod(@Param("memberId") Long memberId,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);

    // 🎯 우선순위 기반 복습 카드 조회 (제한된 수량)
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt <= :now " +
           "ORDER BY " +
           "CASE WHEN cs.dueAt < :now THEN 0 ELSE 1 END, " + // 지연된 카드 우선
           "cs.easeFactor ASC, " +                            // 어려운 카드 우선
           "cs.dueAt ASC " +                                 // 오래된 것 우선
           "LIMIT :maxCards")
    List<CardStat> findPriorityDueCards(@Param("memberId") Long memberId,
                                        @Param("now") LocalDateTime now,
                                        @Param("maxCards") int maxCards);

    // 📊 학습 성과 분석용 쿼리들
    @Query("SELECT AVG(cs.easeFactor) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.totalReviews > 0")
    Double getAverageEaseFactor(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(cs) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.easeFactor < 2.0")
    Long countDifficultCards(@Param("memberId") Long memberId);

    @Query("SELECT COUNT(cs) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.repetitions >= 3")
    Long countMasteredCards(@Param("memberId") Long memberId);

    // 🔥 학습 연속성 분석
    @Query("SELECT DISTINCT DATE(cs.lastReviewedAt) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.lastReviewedAt >= :fromDate " +
           "ORDER BY DATE(cs.lastReviewedAt) DESC")
    List<java.sql.Date> getRecentStudyDates(@Param("memberId") Long memberId,
                                           @Param("fromDate") LocalDateTime fromDate);

    // 📈 복습 패턴 분석 (시간대별)
    @Query("SELECT HOUR(cs.lastReviewedAt) as hour, COUNT(cs) as count " +
           "FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.lastReviewedAt >= :fromDate " +
           "GROUP BY HOUR(cs.lastReviewedAt) " +
           "ORDER BY count DESC")
    List<Object[]> getReviewTimePatterns(@Param("memberId") Long memberId,
                                        @Param("fromDate") LocalDateTime fromDate);

    // 🎯 맞춤형 복습 추천
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.easeFactor < :maxEaseFactor " +
           "AND cs.totalReviews > 0 " +
           "ORDER BY cs.easeFactor ASC, cs.lastReviewedAt ASC " +
           "LIMIT :limit")
    List<CardStat> findStrugglingCards(@Param("memberId") Long memberId,
                                      @Param("maxEaseFactor") Double maxEaseFactor,
                                      @Param("limit") int limit);

    // 🎯 학습 주기 대시보드용 쿼리들
    
    // 오늘 학습해야 할 카드들 (오늘까지 due인 카드들)
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "JOIN FETCH c.deck d " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt <= :endOfToday " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findTodayDueCards(@Param("memberId") Long memberId, 
                                     @Param("endOfToday") LocalDateTime endOfToday);

    // 지연된 카드들 (2-3일 지난 카드들)
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "JOIN FETCH c.deck d " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :threeDaysAgo AND :twoDaysAgo " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findOverdueCards(@Param("memberId") Long memberId,
                                    @Param("threeDaysAgo") LocalDateTime threeDaysAgo,
                                    @Param("twoDaysAgo") LocalDateTime twoDaysAgo);

    // 1일 지난 카드들
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "JOIN FETCH c.deck d " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :startOfYesterday AND :endOfYesterday " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findYesterdayDueCards(@Param("memberId") Long memberId,
                                         @Param("startOfYesterday") LocalDateTime startOfYesterday,
                                         @Param("endOfYesterday") LocalDateTime endOfYesterday);

    // 내일 학습해야 할 카드들
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "JOIN FETCH c.deck d " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :startOfTomorrow AND :endOfTomorrow " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findTomorrowDueCards(@Param("memberId") Long memberId,
                                        @Param("startOfTomorrow") LocalDateTime startOfTomorrow,
                                        @Param("endOfTomorrow") LocalDateTime endOfTomorrow);

    // 3일 이내 학습해야 할 카드들
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "JOIN FETCH c.deck d " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :tomorrow AND :threeDaysLater " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findWithin3DaysCards(@Param("memberId") Long memberId,
                                        @Param("tomorrow") LocalDateTime tomorrow,
                                        @Param("threeDaysLater") LocalDateTime threeDaysLater);

    // 5일 이내 학습해야 할 카드들
    @Query("SELECT cs FROM CardStat cs " +
           "JOIN FETCH cs.card c " +
           "JOIN FETCH c.deck d " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :tomorrow AND :fiveDaysLater " +
           "ORDER BY cs.dueAt ASC")
    List<CardStat> findWithin5DaysCards(@Param("memberId") Long memberId,
                                        @Param("tomorrow") LocalDateTime tomorrow,
                                        @Param("fiveDaysLater") LocalDateTime fiveDaysLater);

    // 학습 주기별 카드 개수 통계 (간단한 버전)
    @Query("SELECT COUNT(cs) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt <= :endOfToday")
    Long countTodayDueCards(@Param("memberId") Long memberId, 
                            @Param("endOfToday") LocalDateTime endOfToday);

    @Query("SELECT COUNT(cs) FROM CardStat cs " +
           "WHERE cs.member.memberId = :memberId " +
           "AND cs.dueAt BETWEEN :threeDaysAgo AND :twoDaysAgo")
    Long countOverdueCards(@Param("memberId") Long memberId,
                           @Param("threeDaysAgo") LocalDateTime threeDaysAgo,
                           @Param("twoDaysAgo") LocalDateTime twoDaysAgo);
} 