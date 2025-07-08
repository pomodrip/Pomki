package com.cooltomato.pomki.member.repository;

import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByMemberEmail(String email);
    boolean existsByMemberEmail(String email);
    Optional<Member> findByMemberIdAndIsDeletedIsFalse(Long memberId);
    Optional<Member> findByProviderAndProviderUserId(AuthType provider, String providerUserId);
    
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.bookmarks WHERE m.memberId = :memberId AND m.isDeleted = false")
    Optional<Member> findByMemberIdWithBookmarks(@Param("memberId") Long memberId);
    
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.cardBookmarks WHERE m.memberId = :memberId AND m.isDeleted = false")
    Optional<Member> findByMemberIdWithCardBookmarks(@Param("memberId") Long memberId);
    
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.trashItems WHERE m.memberId = :memberId AND m.isDeleted = false")
    Optional<Member> findByMemberIdWithTrashItems(@Param("memberId") Long memberId);
    
    @Query("SELECT m FROM Member m LEFT JOIN FETCH m.bookmarks WHERE m.memberEmail = :email")
    Optional<Member> findByMemberEmailWithBookmarks(@Param("email") String email);
    
    List<Member> findByIsDeletedTrueAndDeletedAtBefore(@Param("cutoff") LocalDateTime cutoff);
} 