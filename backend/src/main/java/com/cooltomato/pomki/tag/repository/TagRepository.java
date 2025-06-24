package com.cooltomato.pomki.tag.repository;

import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.tag.entity.Tag;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findAllByMemberId(Long memberId);
} 