package com.cooltomato.pomki.card.repository;

import com.cooltomato.pomki.card.entity.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    
    // 특정 덱의 카드들 조회 (삭제되지 않은 것만)
    List<Card> findByDeckIdAndIsDeletedFalseOrderByCreatedAtAsc(String deckId);
    
    // 특정 사용자의 특정 카드 조회
    Optional<Card> findByCardIdAndMemberIdAndIsDeletedFalse(Long cardId, Long memberId);
    
    // 특정 사용자의 모든 카드 조회 (페이지네이션)
    Page<Card> findByMemberIdAndIsDeletedFalseOrderByCreatedAtDesc(Long memberId, Pageable pageable);
    
    // 특정 사용자의 삭제된 카드들 조회 (휴지통용)
    List<Card> findByMemberIdAndIsDeletedTrueOrderByDeletedAtDesc(Long memberId);
    
    // 특정 덱의 카드 수 카운트
    long countByDeckIdAndIsDeletedFalse(String deckId);
    
    // 특정 사용자의 전체 카드 수
    long countByMemberIdAndIsDeletedFalse(Long memberId);
    
    // 복습이 필요한 카드들 조회 (SRS용)
    @Query("SELECT c FROM Card c JOIN CardStat cs ON c.cardId = cs.cardId " +
           "WHERE c.memberId = :memberId AND c.isDeleted = false " +
           "AND cs.nextReviewAt <= CURRENT_TIMESTAMP " +
           "ORDER BY cs.nextReviewAt ASC")
    List<Card> findCardsForReview(@Param("memberId") Long memberId);
} 