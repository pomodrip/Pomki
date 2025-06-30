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


@RestController
@RequestMapping("/api/note-tag")
@RequiredArgsConstructor
@Slf4j
public class NoteTagController {

    private final NoteTagService service;

    // 노트에 대한 태그 전체 조회 (카드에 대한 태그 표시 X)
    @GetMapping
    public ResponseEntity<List<NoteTagResponseDto>> readAllNoteTag(@AuthenticationPrincipal PrincipalMember principal) {
        List<NoteTagResponseDto> response = service.readAllNoteTagService(principal) ;
        return ResponseEntity.ok(response) ;
    }

    //노트에 태그 추가
    @PostMapping
    public ResponseEntity<NoteTagResponseDto> createNoteTag(@AuthenticationPrincipal PrincipalMember principal, @RequestBody NoteTagRequestDto request) {
        NoteTagResponseDto response = service.createNoteTagService(principal, request) ;
        return ResponseEntity.ok(response) ;
    }

    // 노트에서 태그 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteNoteTag(@AuthenticationPrincipal PrincipalMember principal, @RequestBody NoteTagRequestDto request) {
        service.deleteNoteTagService(principal, request);
        return ResponseEntity.noContent().build();
    }

    // 특정 태그 선택시 태그에 해당하는 모든 노트 조회
    @GetMapping("/{tagName}")
    public ResponseEntity<List<NoteResponseDto>> readNoteByTagName(@AuthenticationPrincipal PrincipalMember principal, @PathVariable String tagName) {
        List<NoteResponseDto> response = service.readNoteByTagNameService(principal, tagName) ;
        return ResponseEntity.ok(response) ;
    }

}
