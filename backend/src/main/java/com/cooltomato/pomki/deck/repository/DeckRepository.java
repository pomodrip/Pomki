package com.cooltomato.pomki.deck.repository;

import com.cooltomato.pomki.card.entity.CardEntity;
import com.cooltomato.pomki.deck.entity.DeckEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.lang.StackWalker.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeckRepository extends JpaRepository<DeckEntity, String> {
    List<DeckEntity> findAllDecksByMemberId(Long memberId);
    boolean existsByMemberIdAndDeckNameAndIsDeletedFalse(Long memberId, String deckName);
    List<CardEntity> findAllCardsByDeckId(String deckId);
}
