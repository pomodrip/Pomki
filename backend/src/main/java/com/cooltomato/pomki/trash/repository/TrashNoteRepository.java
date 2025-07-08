package com.cooltomato.pomki.trash.repository;

import com.cooltomato.pomki.trash.entity.TrashNote;
import com.cooltomato.pomki.trash.entity.TrashNoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrashNoteRepository extends JpaRepository<TrashNote, TrashNoteId> {
    List<TrashNote> findByIdTrashId(String trashId);
    Optional<TrashNote> findByIdNoteId(String noteId);
    void deleteByIdTrashId(String trashId);
} 