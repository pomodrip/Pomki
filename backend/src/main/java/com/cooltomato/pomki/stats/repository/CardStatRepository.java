package com.cooltomato.pomki.stats.repository;

import com.cooltomato.pomki.stats.entity.CardStat;
import com.cooltomato.pomki.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CardStatRepository extends JpaRepository<CardStat, Long> {

    /**
     * 특정 사용자가 특정 카드를 학습한 기록을 조회합니다.
     * 복습 결과 처리 시 정확한 CardStat 객체를 찾기 위해 사용됩니다.
     *
     * @param member 사용자 엔티티
     * @param cardId 카드 ID
     * @return Optional<CardStat>
     */
    Optional<CardStat> findByMemberAndCard_CardId(Member member, Long cardId);

    /**
     * 특정 사용자의 오늘 복습해야 할 카드 목록을 시간순으로 정렬하여 조회합니다.
     * 복습 기한(dueAt)이 지났거나 오늘인 모든 카드를 가져옵니다.
     *
     * @param memberId 사용자 ID
     * @param now 현재 시각
     * @return List<CardStat>
     */
    List<CardStat> findByMember_MemberIdAndDueAtLessThanEqualOrderByDueAtAsc(Long memberId, LocalDateTime now);

    /**
     * 특정 사용자의 오늘 복습해야 할 카드의 총 개수를 조회합니다.
     * 대시보드 통계용으로 사용됩니다.
     *
     * @param memberId 사용자 ID
     * @param now 현재 시각
     * @return int
     */
    @Query("SELECT COUNT(cs) FROM CardStat cs WHERE cs.member.id = :memberId AND cs.dueAt <= :now")
    int countByMember_MemberIdAndDueAtLessThanEqual(@Param("memberId") Long memberId, @Param("now") LocalDateTime now);

    /**
     * 특정 기간 동안 사용자가 복습을 완료한 카드의 개수를 조회합니다.
     *
     * @param memberId 사용자 ID
     * @param start 시작 시각
     * @param end 종료 시각
     * @return int
     */
    @Query("SELECT COUNT(cs) FROM CardStat cs WHERE cs.member.id = :memberId AND cs.lastReviewedAt BETWEEN :start AND :end")
    int countByMember_MemberIdAndLastReviewedAtBetween(@Param("memberId") Long memberId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 특정 기간 내에 복습이 예정된 카드의 개수를 조회합니다.
     *
     * @param memberId 사용자 ID
     * @param start 시작 시각
     * @param end 종료 시각
     * @return int
     */
    @Query("SELECT COUNT(cs) FROM CardStat cs WHERE cs.member.id = :memberId AND cs.dueAt BETWEEN :start AND :end")
    int countByMember_MemberIdAndDueAtBetween(@Param("memberId") Long memberId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    /**
     * 특정 시각 이전에 복습 기한이 도래한 카드의 개수를 조회합니다. (미완료 카드)
     *
     * @param memberId 사용자 ID
     * @param now 현재 시각
     * @return int
     */
    @Query("SELECT COUNT(cs) FROM CardStat cs WHERE cs.member.id = :memberId AND cs.dueAt < :now")
    int countByMember_MemberIdAndDueAtBefore(@Param("memberId") Long memberId, @Param("now") LocalDateTime now);

    /**
     * 특정 시각 이전에 복습 기한이 도래한 카드 목록을 조회합니다. (미완료 카드 목록)
     *
     * @param memberId 사용자 ID
     * @param endExclusive 조회할 기간의 상한 (해당 시각 미포함)
     * @return List<CardStat>
     */
    List<CardStat> findByMember_MemberIdAndDueAtBeforeOrderByDueAtAsc(Long memberId, LocalDateTime endExclusive);

    /**
     * 특정 기간 내에 복습이 예정된 카드 목록을 조회합니다.
     *
     * @param memberId 사용자 ID
     * @param startInclusive 조회할 기간의 하한 (해당 시각 포함)
     * @param endExclusive 조회할 기간의 상한 (해당 시각 미포함)
     * @return List<CardStat>
     */
    List<CardStat> findByMember_MemberIdAndDueAtBetweenOrderByDueAtAsc(Long memberId, LocalDateTime startInclusive, LocalDateTime endExclusive);
} 