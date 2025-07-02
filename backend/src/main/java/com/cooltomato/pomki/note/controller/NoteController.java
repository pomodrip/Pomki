package com.cooltomato.pomki.note.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.note.dto.NoteCreateRequestDto;
import com.cooltomato.pomki.note.dto.NoteListResponseDto;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.dto.NoteUpdateRequestDto;
import com.cooltomato.pomki.note.service.NoteService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    @PostMapping
    public ResponseEntity<NoteResponseDto> createNote(@Valid @RequestBody NoteCreateRequestDto noteRequestDto,
                                                      @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        NoteResponseDto responseDto = noteService.createNote(noteRequestDto, memberInfoDto);
        return ResponseEntity.created(URI.create("/api/notes/" + responseDto.getNoteId()))
                .body(responseDto);
    }

    @GetMapping
    public ResponseEntity<List<NoteListResponseDto>> readNote(@AuthenticationPrincipal PrincipalMember memberInfoDto) {
        List<NoteListResponseDto> responseDto = noteService.readNote(memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteResponseDto> readNoteById(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                                                        @PathVariable("id") String id,
                                                        @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        NoteResponseDto responseDto = noteService.readNoteById(id, memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                                           @PathVariable("id") String id,
                                           @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        noteService.deleteNote(id, memberInfoDto);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<NoteResponseDto> updateNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                                                      @PathVariable("id") String id,
                                                      @Valid @RequestBody NoteUpdateRequestDto noteRequestDto,
                                                      @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        NoteResponseDto responseDto = noteService.updateNote(id, noteRequestDto, memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }
} 