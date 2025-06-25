package com.cooltomato.pomki.ai.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cooltomato.pomki.ai.entity.AI;

@Repository
public interface AIRepository extends JpaRepository<AI, Long> {
    Optional<AI> findByCardIdAndIsDeletedFalse(Long cardId);
}
