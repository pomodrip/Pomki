package com.cooltomato.pomki.cardtag.repository;

import com.cooltomato.pomki.cardtag.entity.CardTag;
import com.cooltomato.pomki.cardtag.entity.CardTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardTagRepository extends JpaRepository<CardTag, CardTagId> {

    void deleteByCardIdAndMemberIdAndTagName(Long cardId, Long memberId, String tagName);
    
    long countByTagNameAndMemberId(String tagName, Long memberId);

    List<CardTag> findByMemberId(Long memberId);

    List<CardTag> findByMemberIdAndTagName(Long memberId, String tagName);

    List<CardTag> findAllCardIdByMemberIdAndTagName(Long memberId, String tagName);
} 
