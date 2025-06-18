package com.cooltomato.pomki.card.repository;

import com.cooltomato.pomki.card.entity.CardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<CardEntity, String> {
    List<CardEntity> findByDeckDeckIdAndIsDeletedFalse(String deckId);
} 