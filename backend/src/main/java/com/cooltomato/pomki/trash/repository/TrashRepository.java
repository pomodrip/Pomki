package com.cooltomato.pomki.trash.repository;

import com.cooltomato.pomki.trash.entity.Trash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrashRepository extends JpaRepository<Trash, String> {
    List<Trash> findByMemberIdOrderByDeletedAtDesc(Long memberId);
    void deleteByMemberIdAndDeletedAtBefore(Long memberId, LocalDateTime cutoffDate);
    long countByMemberId(Long memberId);
} 