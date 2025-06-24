package com.cooltomato.pomki.tag.repository;

import com.cooltomato.pomki.tag.entity.TagCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardTagRepository extends JpaRepository<TagCard, Long> {
} 