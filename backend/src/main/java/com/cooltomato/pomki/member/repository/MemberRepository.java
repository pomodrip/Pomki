package com.cooltomato.pomki.member.repository;

import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByMemberEmail(String email);
    boolean existsByMemberEmail(String email);
    Optional<Member> findByProviderAndProviderUserId(AuthType provider, String providerUserId);
} 