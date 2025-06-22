package com.cooltomato.pomki.card.repository;

import com.cooltomato.pomki.card.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByMemberMemberIdOrderByCreatedAtDesc(Long memberId);
} 