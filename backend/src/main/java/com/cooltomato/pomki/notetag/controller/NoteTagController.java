package com.cooltomato.pomki.notetag.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.notetag.dto.NoteTagRequestDto;
import com.cooltomato.pomki.notetag.dto.NoteTagResponseDto;
import com.cooltomato.pomki.notetag.service.NoteTagService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/note-tag")
@RequiredArgsConstructor
@Slf4j
public class NoteTagController {

    private final NoteTagService service;

    //노트에 태그 추가
    @PostMapping
    public String createNoteTag(@AuthenticationPrincipal PrincipalMember principal, @RequestParam("tagName") String tagName) {
        service.createNoteTagService(principal, tagName) ;

        return null ;
    }
    

    // // 노트에 태그 추가
    // @PostMapping
    // public ResponseEntity<NoteTagResponseDto> createNoteTag(@Valid @RequestBody NoteTagRequestDto noteTagRequestDto,
    //                                                        @AuthenticationPrincipal PrincipalMember memberInfoDto) {
    //     NoteTagResponseDto responseDto = noteTagService.createNoteTag(noteTagRequestDto, memberInfoDto);
    //     return ResponseEntity.created(URI.create("/api/note-tag/" + responseDto.getNoteTagId()))
    //             .body(responseDto);
    // }

    // // 노트의 모든 태그 조회
    // @GetMapping("/note/{noteId}")
    // public ResponseEntity<List<NoteTagResponseDto>> getNoteTagsByNoteId(@Parameter(name = "noteId", example = "1", description = "노트 고유 아이디", required = true)
    //                                                                     @PathVariable("noteId") String noteId,
    //                                                                     @AuthenticationPrincipal PrincipalMember memberInfoDto) {
    //     List<NoteTagResponseDto> responseDto = noteTagService.getNoteTagsByNoteId(noteId, memberInfoDto);
    //     return ResponseEntity.ok(responseDto);
    // }

    // // 특정 노트 태그 조회
    // @GetMapping("/{id}")
    // public ResponseEntity<NoteTagResponseDto> getNoteTagById(@Parameter(name = "id", example = "1", description = "노트 태그 고유 아이디", required = true)
    //                                                         @PathVariable("id") String id,
    //                                                         @AuthenticationPrincipal PrincipalMember memberInfoDto) {
    //     NoteTagResponseDto responseDto = noteTagService.getNoteTagById(id, memberInfoDto);
    //     return ResponseEntity.ok(responseDto);
    // }

    // // 노트 태그 삭제
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteNoteTag(@Parameter(name = "id", example = "1", description = "노트 태그 고유 아이디", required = true)
    //                                          @PathVariable("id") String id,
    //                                          @AuthenticationPrincipal PrincipalMember memberInfoDto) {
    //     noteTagService.deleteNoteTag(id, memberInfoDto);
    //     return ResponseEntity.noContent().build();
    // }
}
