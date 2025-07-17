package com.cooltomato.pomki.trash.repository;

import com.cooltomato.pomki.trash.entity.TrashDeck;
import com.cooltomato.pomki.trash.entity.TrashDeckId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrashDeckRepository extends JpaRepository<TrashDeck, TrashDeckId> {
    List<TrashDeck> findByIdTrashId(String trashId);
    Optional<TrashDeck> findByIdDeckId(String deckId);
    void deleteByIdTrashId(String trashId);
} 