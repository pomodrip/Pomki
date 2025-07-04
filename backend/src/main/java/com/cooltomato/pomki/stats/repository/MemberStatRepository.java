package com.cooltomato.pomki.stats.repository;

import com.cooltomato.pomki.stats.entity.MemberStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberStatRepository extends JpaRepository<MemberStat, Long> {
} 