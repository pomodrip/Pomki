package com.cooltomato.pomki.card.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.cooltomato.pomki.card.entity.CardEntity;

@Repository
public interface CardRepository extends JpaRepository<CardEntity, Long> {
} 