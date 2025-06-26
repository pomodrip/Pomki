package com.cooltomato.pomki.bookmark.repository;

import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.entity.BookmarkId;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.note.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, BookmarkId> {
    Optional<Bookmark> findByMemberAndNote(Member member, Note note);
    List<Bookmark> findAllByMember(Member member);
    void deleteByMemberAndNote(Member member, Note note);
} 