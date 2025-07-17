package com.cooltomato.pomki.stats.repository;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.stats.entity.MemberStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberStatRepository extends JpaRepository<MemberStat, Long> {
    Optional<MemberStat> findByMember(Member member);
} 