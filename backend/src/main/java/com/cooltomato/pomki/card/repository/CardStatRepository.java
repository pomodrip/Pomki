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
} 