package com.cooltomato.pomki.tag.repository;

import com.cooltomato.pomki.tag.entity.TagCard;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagCardRepository extends JpaRepository<TagCard, TagCard.TagCardId> {
} 