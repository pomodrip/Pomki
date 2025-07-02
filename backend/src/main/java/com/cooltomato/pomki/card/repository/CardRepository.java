package com.cooltomato.pomki.card.repository;

import com.cooltomato.pomki.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByCardIdAndIsDeletedFalse(Long cardId);
    List<Card> findByDeckDeckIdAndIsDeletedFalse(String deckId);
    List<Card> findByDeckDeckIdInAndIsDeletedFalse(List<String> deckIds);
    List<Card> findByContentContainingIgnoreCaseOrAnswerContainingIgnoreCaseAndIsDeletedFalse(String contentKeyword, String answerKeyword);
    
    // 사용자의 덱에 속한 카드들 중에서 키워드로 검색 (삭제되지 않은 카드만)
    List<Card> findByDeck_MemberIdAndIsDeletedFalseAndContentContainingIgnoreCaseOrDeck_MemberIdAndIsDeletedFalseAndAnswerContainingIgnoreCase(
        Long memberId, String contentKeyword, Long memberId2, String answerKeyword);
} 