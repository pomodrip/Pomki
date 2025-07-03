package com.cooltomato.pomki.trash.repository;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.trash.entity.Trash;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TrashRepository extends JpaRepository<Trash, String> {
    List<Trash> findByMember_MemberIdOrderByDeletedAtDesc(Long memberId);
    void deleteByMember_MemberIdAndDeletedAtBefore(Long memberId, LocalDateTime cutoffDate);
    long countByMember_MemberId(Long memberId);
} 