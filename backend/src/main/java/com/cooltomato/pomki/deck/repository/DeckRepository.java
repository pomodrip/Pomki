package com.cooltomato.pomki.deck.repository;

import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.deck.entity.Deck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeckRepository extends JpaRepository<Deck, String> {
    List<Deck> findAllDecksByMemberId(Long memberId);
    boolean existsByMemberIdAndDeckNameAndIsDeletedFalse(Long memberId, String deckName);
    Optional<Card> findAllCardsByDeckId(String deckId);
    List<Deck> findAllDecksByMemberIdAndIsDeletedFalse(Long memberId);
    Optional<Deck> findByMemberIdAndDeckIdAndIsDeletedFalse(Long memberId, String deckId);
    List<Deck> findByMemberIdAndIsDeletedFalse(Long memberId);
    Deck findMemberIdByDeckId(String deckId);
    Optional<Deck> findByMemberIdAndDeckNameAndIsDeletedFalse(Long memberId, String deckName);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Deck d WHERE d.memberId = :memberId AND d.deckId = :deckId AND d.isDeleted = false")
    Optional<Deck> findByMemberIdAndDeckIdAndIsDeletedFalseWithLock(@Param("memberId") Long memberId, @Param("deckId") String deckId);
}
