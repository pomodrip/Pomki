package com.cooltomato.pomki.deck.repository;

import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.deck.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeckRepository extends JpaRepository<Deck, String> {
    List<Deck> findAllDecksByMemberId(Long memberId);
    boolean existsByMemberIdAndDeckNameAndIsDeletedFalse(Long memberId, String deckName);
    Optional<Card> findAllCardsByDeckId(String deckId);
    List<Deck> findAllDecksByMemberIdAndIsDeletedFalse(Long memberId);
    Optional<Deck> findByDeckIdAndIsDeletedFalse(String deckId);
}
