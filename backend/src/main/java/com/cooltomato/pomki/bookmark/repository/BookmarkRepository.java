package com.cooltomato.pomki.bookmark.repository;

import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.entity.BookmarkId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, BookmarkId> {
    List<Bookmark> findByMemberMemberId(Long memberId);
    List<Bookmark> findByNoteNoteId(String noteId);
    Optional<Bookmark> findByMemberMemberIdAndNoteNoteId(Long memberId, String noteId);
    boolean existsByMemberMemberIdAndNoteNoteId(Long memberId, String noteId);
    void deleteByMemberMemberIdAndNoteNoteId(Long memberId, String noteId);
} 