package com.cooltomato.pomki.note.repository;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.note.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, String> {
    List<Note> findAllByMemberAndIsDeletedIsFalse(Member member);
    Optional<Note> findByNoteIdAndMemberAndIsDeletedIsFalse(String noteId, Member member);
    Optional<Note> findByMember_MemberIdAndNoteId(Long memberId, String noteId);
    Optional<Note> findByMember_MemberIdAndNoteIdAndIsDeletedIsFalse(Long memberId, String noteId);
    Optional<Note> findByMember_MemberIdAndNoteIdAndIsDeletedIsTrue(Long memberId, String noteId);
} 