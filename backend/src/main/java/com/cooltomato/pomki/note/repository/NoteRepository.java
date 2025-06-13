package com.cooltomato.pomki.note.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cooltomato.pomki.note.entity.Note;

public interface NoteRepository extends JpaRepository<Note, String> {
    
} 