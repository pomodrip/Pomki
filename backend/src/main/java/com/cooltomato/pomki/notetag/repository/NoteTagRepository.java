package com.cooltomato.pomki.notetag.repository;

import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.notetag.entity.NoteTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteTagRepository extends JpaRepository<NoteTag, NoteTagId> {

    // 특정 멤버의 모든 노트 태그 조회
    List<NoteTag> findByMemberId(Long memberId);
    
    // 특정 노트의 모든 태그 조회
    List<NoteTag> findByNoteId(String noteId);
    
    // 특정 멤버의 특정 노트 태그 조회
    List<NoteTag> findByMemberIdAndNoteId(Long memberId, String noteId);
    
    // 특정 태그명으로 조회
    List<NoteTag> findByTagName(String tagName);
    
    // 특정 멤버의 특정 태그명으로 조회
    List<NoteTag> findByMemberIdAndTagName(Long memberId, String tagName);
    
    // 특정 노트 태그 존재 여부 확인
    boolean existsByMemberIdAndTagNameAndNoteId(Long memberId, String tagName, String noteId);
    
    // 특정 멤버의 특정 노트 태그 삭제
    void deleteByMemberIdAndTagNameAndNoteId(Long memberId, String tagName, String noteId);
    
    // 특정 노트의 모든 태그 삭제
    void deleteByNoteId(String noteId);
    
    // 특정 멤버의 모든 노트 태그 삭제
    void deleteByMemberId(Long memberId);
    
    // 특정 멤버의 특정 노트의 모든 태그 삭제
    void deleteByMemberIdAndNoteId(Long memberId, String noteId);
    
    // 특정 멤버의 특정 태그명 삭제
    void deleteByMemberIdAndTagName(Long memberId, String tagName);
} 
