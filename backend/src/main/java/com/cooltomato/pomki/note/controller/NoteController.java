package com.cooltomato.pomki.note.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.note.dto.NoteCreateRequestDto;
import com.cooltomato.pomki.note.dto.NoteListResponseDto;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.dto.NoteUpdateRequestDto;
import com.cooltomato.pomki.note.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@Tag(name = "Note", description = "노트 관리 API")
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    
    @Operation(summary = "노트 생성", description = "새로운 노트를 생성합니다. 이미지 파일도 함께 업로드할 수 있습니다.")
    @Operation(summary = "노트 생성", description = "새로운 노트를 생성합니다.")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoteResponseDto> createNote(
            @Parameter(description = "노트 생성 요청 데이터", required = true)
            @RequestPart("note") @Valid NoteCreateRequestDto noteRequestDto,
            @Parameter(description = "첨부할 이미지 파일들", required = false)
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        
        NoteResponseDto responseDto = noteService.createNote(noteRequestDto, imageFiles, memberInfoDto);
        return ResponseEntity.created(URI.create("/api/notes/" + responseDto.getNoteId()))
                .body(responseDto);
    }

    @Operation(summary = "노트 목록 조회", description = "사용자의 모든 노트 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<NoteListResponseDto>> readNote(@AuthenticationPrincipal PrincipalMember memberInfoDto) {
        List<NoteListResponseDto> responseDto = noteService.readNote(memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "노트 단건 조회", description = "노트 ID로 단일 노트 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<NoteResponseDto> readNoteById(
            @Parameter(name = "id", description = "노트 고유 ID", required = true, example = "abc123-def456-ghi789")
            @PathVariable("id") String id,
            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        NoteResponseDto responseDto = noteService.readNoteById(id, memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "노트 삭제", description = "특정 노트를 삭제합니다. 관련 이미지도 함께 삭제됩니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @Parameter(name = "id", description = "노트 고유 ID", required = true, example = "abc123-def456-ghi789")
            @PathVariable("id") String id,
            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        noteService.deleteNote(id, memberInfoDto);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "노트 수정", description = "기존 노트를 수정합니다. 새 이미지 추가 및 기존 이미지 삭제가 가능합니다.")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoteResponseDto> updateNote(
            @Parameter(name = "id", description = "노트 고유 ID", required = true, example = "abc123-def456-ghi789")
            @PathVariable("id") String id,
            @Parameter(description = "노트 수정 요청 데이터", required = true)
            @RequestPart("note") @Valid NoteUpdateRequestDto noteRequestDto,
            @Parameter(description = "추가할 이미지 파일들", required = false)
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        
        NoteResponseDto responseDto = noteService.updateNote(id, noteRequestDto, imageFiles, memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }
} 