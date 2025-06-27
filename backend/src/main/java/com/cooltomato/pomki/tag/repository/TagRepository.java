package com.cooltomato.pomki.tag.repository;

import com.cooltomato.pomki.tag.entity.Tag;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findAllByMember_MemberId(Long memberId);

    List<Tag> findAllByMember_MemberIdAndTagName(Long memberId, String tagName);
} 