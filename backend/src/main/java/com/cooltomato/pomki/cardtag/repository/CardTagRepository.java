package com.cooltomato.pomki.cardtag.repository;

import com.cooltomato.pomki.cardtag.entity.CardTag;
import com.cooltomato.pomki.cardtag.entity.CardTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardTagRepository extends JpaRepository<CardTag, CardTagId> {

    void deleteByCardIdAndMemberIdAndTagName(Long cardId, Long memberId, String tagName);
    
    long countByTagNameAndMemberId(String tagName, Long memberId);

    List<CardTag> findByMemberId(Long memberId);

    List<CardTag> findByMemberIdAndTagName(Long memberId, String tagName);

    List<CardTag> findAllCardIdByMemberIdAndTagName(Long memberId, String tagName);

    
    List<CardTag> findByCard_CardId(Long cardId);

    @Query("SELECT ct.tagName FROM CardTag ct WHERE ct.cardId = :cardId AND ct.memberId = :memberId")
    List<String> findTagNameByCardId(@Param("cardId") Long cardId, @Param("memberId") Long memberId);
} 
