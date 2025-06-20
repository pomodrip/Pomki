package com.cooltomato.pomki.note.repository;

import com.cooltomato.pomki.note.entity.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, String> {
    
    // 특정 사용자의 삭제되지 않은 노트 조회 (페이지네이션)
    Page<Note> findByMemberIdAndIsDeletedFalseOrderByUpdatedAtDesc(Long memberId, Pageable pageable);
    
    // 특정 사용자의 특정 노트 조회 (삭제되지 않은 것만)
    Optional<Note> findByNoteIdAndMemberIdAndIsDeletedFalse(String noteId, Long memberId);
    
    // 특정 사용자의 삭제된 노트 조회 (휴지통용)
    List<Note> findByMemberIdAndIsDeletedTrueOrderByDeletedAtDesc(Long memberId);
    
    // AI 향상이 필요한 노트 조회
    @Query("SELECT n FROM Note n WHERE n.memberId = :memberId AND n.aiEnhanced = false AND n.isDeleted = false")
    List<Note> findNotesNeedingAIEnhancement(@Param("memberId") Long memberId);
    
    // 특정 사용자의 전체 노트 수 (삭제되지 않은 것만)
    long countByMemberIdAndIsDeletedFalse(Long memberId);
} 