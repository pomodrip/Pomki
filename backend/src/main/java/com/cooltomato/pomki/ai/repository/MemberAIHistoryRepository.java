package com.cooltomato.pomki.ai.repository;

import com.cooltomato.pomki.ai.entity.MemberAIHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberAIHistoryRepository extends JpaRepository<MemberAIHistory, Long> {
} 