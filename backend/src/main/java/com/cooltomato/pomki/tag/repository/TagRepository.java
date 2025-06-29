package com.cooltomato.pomki.tag.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.entity.TagId;

@Repository
public interface TagRepository extends JpaRepository<Tag, TagId> {

  List<Tag> findByMemberId(Long memberId);
    
}
