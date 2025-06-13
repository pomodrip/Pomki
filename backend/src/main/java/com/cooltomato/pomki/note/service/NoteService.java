package com.cooltomato.pomki.note.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;

    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    public List<Note> readNote() {
        return noteRepository.findAll();
    }

    public Note readNoteById(String id) {
        return noteRepository.findById(id).orElse(null);
    }


    @Transactional
    public void deleteNote(String id) {
        Note note = noteRepository.findById(id).orElseThrow(() -> new RuntimeException("Note not found"));
        note.setIsDeleted(true); // Soft delete
        noteRepository.save(note);
    }
    @Transactional
    public void updateNote(Note note) {
        Note entity = noteRepository.findById(note.getNoteId()).orElseThrow(() -> new RuntimeException("Note not found"));
        entity.setNoteTitle(note.getNoteTitle());
        entity.setNoteContent(note.getNoteContent());
        entity.setOriginalContent(note.getOriginalContent());
        // No need to set isDeleted, as it should not be updated
        noteRepository.save(entity);
    }   
        
}