package com.cooltomato.pomki.notetag.repository;

import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.notetag.entity.NoteTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface NoteTagRepository extends JpaRepository<NoteTag, NoteTagId> {

    void deleteByNoteIdAndMemberIdAndTagName(String noteId, Long memberId, String tagName);
    
    long countByTagNameAndMemberId(String tagName, Long memberId);

    List<NoteTag> findByMemberId(Long memberId);

    List<NoteTag> findByMemberIdAndTagName(Long memberId, String tagName);

    List<NoteTag> findAllNoteIdByMemberIdAndTagName(Long memberId, String tagName);

    @Query("SELECT nt.tagName FROM NoteTag nt WHERE nt.memberId = :memberId")
    List<String> findTagNameByMemberId(@Param("memberId") Long memberId);

    @Query("SELECT nt.tagName FROM NoteTag nt WHERE nt.noteId = :noteId AND nt.memberId = :memberId")
    List<String> findTagNameByNoteIdAndMemberId(@Param("noteId") String noteId, @Param("memberId") Long memberId);

    List<String> findTagNameByNoteId(String id);
} 
