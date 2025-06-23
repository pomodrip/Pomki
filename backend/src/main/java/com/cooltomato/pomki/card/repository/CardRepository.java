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
} 