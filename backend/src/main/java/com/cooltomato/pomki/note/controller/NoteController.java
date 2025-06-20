package com.cooltomato.pomki.note.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.note.dto.NoteDto;
import com.cooltomato.pomki.note.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "노트 관리", description = "노트 CRUD 및 AI 향상 기능")
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @Operation(summary = "노트 생성", description = "새로운 노트를 생성합니다.")
    @PostMapping
    public ResponseEntity<NoteDto.Response> createNote(
            @AuthenticationPrincipal PrincipalMember principal,
            @Valid @RequestBody NoteDto.CreateRequest request) {
        
        NoteDto.Response response = noteService.createNote(
            principal.getMemberInfo().getMemberId(), 
            request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "노트 목록 조회", description = "사용자의 노트 목록을 페이지네이션하여 조회합니다.")
    @GetMapping
    public ResponseEntity<Page<NoteDto.Response>> getNotes(
            @AuthenticationPrincipal PrincipalMember principal,
            @PageableDefault(size = 20, sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Page<NoteDto.Response> notes = noteService.getNotes(
            principal.getMemberInfo().getMemberId(), 
            pageable
        );
        return ResponseEntity.ok(notes);
    }

    @Operation(summary = "노트 상세 조회", description = "특정 노트의 상세 정보를 조회합니다.")
    @GetMapping("/{noteId}")
    public ResponseEntity<NoteDto.Response> getNote(
            @AuthenticationPrincipal PrincipalMember principal,
            @Parameter(description = "노트 ID") @PathVariable String noteId) {
        
        NoteDto.Response note = noteService.getNote(
            principal.getMemberInfo().getMemberId(), 
            noteId
        );
        return ResponseEntity.ok(note);
    }

    @Operation(summary = "노트 수정", description = "기존 노트의 내용을 수정합니다.")
    @PutMapping("/{noteId}")
    public ResponseEntity<NoteDto.Response> updateNote(
            @AuthenticationPrincipal PrincipalMember principal,
            @Parameter(description = "노트 ID") @PathVariable String noteId,
            @Valid @RequestBody NoteDto.UpdateRequest request) {
        
        NoteDto.Response response = noteService.updateNote(
            principal.getMemberInfo().getMemberId(), 
            noteId, 
            request
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "노트 삭제", description = "노트를 휴지통으로 이동시킵니다.")
    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal PrincipalMember principal,
            @Parameter(description = "노트 ID") @PathVariable String noteId) {
        
        noteService.deleteNote(
            principal.getMemberInfo().getMemberId(), 
            noteId
        );
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "AI 노트 향상 요청", 
              description = "비동기 AI 노트 향상 작업을 시작합니다. 즉시 202 Accepted를 반환합니다.")
    @PostMapping("/{noteId}/polish")
    public ResponseEntity<Void> polishNote(
            @AuthenticationPrincipal PrincipalMember principal,
            @Parameter(description = "노트 ID") @PathVariable String noteId,
            @Valid @RequestBody NoteDto.PolishRequest request) {
        
        noteService.requestNotePolishing(
            principal.getMemberInfo().getMemberId(), 
            noteId, 
            request.getPromptName()
        );
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @Operation(summary = "휴지통 노트 조회", description = "삭제된 노트 목록을 조회합니다.")
    @GetMapping("/trash")
    public ResponseEntity<List<NoteDto.Response>> getDeletedNotes(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        List<NoteDto.Response> deletedNotes = noteService.getDeletedNotes(
            principal.getMemberInfo().getMemberId()
        );
        return ResponseEntity.ok(deletedNotes);
    }

    @Operation(summary = "노트 복원", description = "휴지통의 노트를 복원합니다.")
    @PostMapping("/{noteId}/restore")
    public ResponseEntity<Void> restoreNote(
            @AuthenticationPrincipal PrincipalMember principal,
            @Parameter(description = "노트 ID") @PathVariable String noteId) {
        
        noteService.restoreNote(
            principal.getMemberInfo().getMemberId(), 
            noteId
        );
        return ResponseEntity.ok().build();
    }
} 