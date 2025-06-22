package com.cooltomato.pomki.noteimage.repository;

import com.cooltomato.pomki.noteimage.entity.NoteImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteImageRepository extends JpaRepository<NoteImage, Long> {
    
    List<NoteImage> findByNoteId(String noteId);
    
    void deleteByNoteId(String noteId);
    
} 