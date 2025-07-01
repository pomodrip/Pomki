package com.cooltomato.pomki.noteimage.repository;

import com.cooltomato.pomki.noteimage.entity.NoteImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteImageRepository extends JpaRepository<NoteImage, Long> {
    
    List<NoteImage> findByNote_NoteId(String noteId);
    
    void deleteByNote_NoteId(String noteId);

    List<NoteImage> findByNoteId(String id);
    
} 