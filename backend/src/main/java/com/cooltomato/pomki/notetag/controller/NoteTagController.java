package com.cooltomato.pomki.notetag.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.notetag.dto.NoteTagRequestDto;
import com.cooltomato.pomki.notetag.dto.NoteTagResponseDto;
import com.cooltomato.pomki.notetag.service.NoteTagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


@Tag(name = "Note Tag", description = "노트 태그 관련 API")
@RestController
@RequestMapping("/api/note-tag")
@RequiredArgsConstructor
@Slf4j
public class NoteTagController {

    private final NoteTagService service;

    // [Tag] readAllNoteTag: 노트에 대한 태그 전체 조회 (카드에 대한 태그 표시 X)
    @Operation(summary = "노트 태그 전체 조회", description = "노트에 대한 태그 전체를 조회합니다.")
    @GetMapping
    public ResponseEntity<List<NoteTagResponseDto>> readAllNoteTag(@AuthenticationPrincipal PrincipalMember principal) {
        List<NoteTagResponseDto> response = service.readAllNoteTagService(principal) ;
        return ResponseEntity.ok(response) ;
    }

    // [Tag] createNoteTag: 노트에 태그 추가
    @Operation(summary = "노트에 태그 추가", description = "노트에 태그를 추가합니다.")
    @PostMapping
    public ResponseEntity<List<NoteTagResponseDto>> createNoteTag(@AuthenticationPrincipal PrincipalMember principal, @RequestBody NoteTagRequestDto request) {
        List<NoteTagResponseDto> response = service.createNoteTagService(principal, request) ;
        return ResponseEntity.ok(response) ;
    }

    @Operation(summary = "노트에서 태그 삭제", description = "노트에서 특정 태그를 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<Void> deleteNoteTag(@AuthenticationPrincipal PrincipalMember principal, @RequestParam("noteId") String noteId, @RequestParam("tagName") String tagName) {
        service.deleteNoteTagService(principal, noteId, tagName);
        return ResponseEntity.noContent().build();
    }

    // [Tag] readNoteByTagName: 특정 태그 선택시 태그에 해당하는 모든 노트 조회
    @Operation(summary = "특정 태그의 노트 조회", description = "특정 태그에 해당하는 모든 노트를 조회합니다.")
    @GetMapping("/{tagName}")
    public ResponseEntity<List<NoteResponseDto>> readNoteByTagName(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("tagName") String tagName) {
        List<NoteResponseDto> response = service.readNoteByTagNameService(principal, tagName) ;
        return ResponseEntity.ok(response) ;
    }

}
