package com.cooltomato.pomki.bookmark.repository;

import com.cooltomato.pomki.bookmark.entity.CardBookmark;
import com.cooltomato.pomki.bookmark.entity.CardBookmarkId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardBookmarkRepository extends JpaRepository<CardBookmark, CardBookmarkId> {
    List<CardBookmark> findByMemberMemberId(Long memberId);
    List<CardBookmark> findByCardCardId(Long cardId);
    Optional<CardBookmark> findByMemberMemberIdAndCardCardId(Long memberId, Long cardId);
    boolean existsByMemberMemberIdAndCardCardId(Long memberId, Long cardId);
    void deleteByMemberMemberIdAndCardCardId(Long memberId, Long cardId);
    boolean existsByCardCardId(Long cardId);
} 