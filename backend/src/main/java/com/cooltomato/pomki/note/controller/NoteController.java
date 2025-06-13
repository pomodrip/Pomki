package com.cooltomato.pomki.note.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.security.access.method.P;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;

import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.service.NoteService;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;
    @PostMapping
    public Note createNote( @Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @Valid
                            @RequestBody Note note
                            ) {
        return noteService.createNote(note);
    }

    @GetMapping
    public List<Note> readNote() {
        return noteService.readNote();
    }

    @GetMapping("/{id}")
    public Note readNoteById(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @PathVariable("id") String id) {
        return noteService.readNoteById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @Valid
                            @PathVariable("id") String id) {
        noteService.deleteNote(id);
    }
    @PutMapping("/{id}")
    public void updateNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @PathVariable("id") String id,
                            @Valid 
                            @RequestBody Note note) {
        note.setNoteId(id); // Ensure the note ID is set to the path variable ID
        noteService.updateNote(note);
    }
} 