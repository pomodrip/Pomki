package com.cooltomato.pomki.note.controller;

import com.cooltomato.pomki.note.dto.NoteRequestDto;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
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
    public Note createNote(@Valid @RequestBody NoteRequestDto noteRequestDto,
                           @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        return noteService.createNote(noteRequestDto, memberInfoDto);
    }

    @GetMapping
    public List<Note> readNote(@AuthenticationPrincipal PrincipalMember memberInfoDto) {
        return noteService.readNote(memberInfoDto);
    }

    @GetMapping("/{id}")
    public Note readNoteById(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @PathVariable("id") String id, 
                            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        return noteService.readNoteById(id, memberInfoDto);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @PathVariable("id") String id,
                            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        noteService.deleteNote(id, memberInfoDto);
    }
    @PutMapping("/{id}")
    public void updateNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                            @PathVariable("id") String id,
                            @Valid @RequestBody NoteRequestDto noteRequestDto,
                                @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        noteService.updateNote(id, noteRequestDto, memberInfoDto);
    }
} 