package com.cooltomato.pomki.note.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.note.dto.NoteCreateRequestDto;
import com.cooltomato.pomki.note.dto.NoteListResponseDto;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.dto.NoteUpdateRequestDto;
import com.cooltomato.pomki.note.service.NoteService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
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
    
    @Operation(summary = "노트 생성 (JSON)", description = "새로운 노트를 생성합니다. (이미지 업로드 없음)")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<NoteResponseDto> createNote(
            @Valid @RequestBody NoteCreateRequestDto noteRequestDto,
            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        
        NoteResponseDto responseDto = noteService.createNote(noteRequestDto, memberInfoDto);
        return ResponseEntity.created(URI.create("/api/notes/" + responseDto.getNoteId()))
                .body(responseDto);
    }

    @Operation(summary = "노트 생성 (이미지 포함)", description = "새로운 노트를 생성합니다. 이미지 파일도 함께 업로드할 수 있습니다.")
    @PostMapping(value = "/with-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NoteResponseDto> createNoteWithImages(
            @Parameter(description = "노트 제목", required = true) 
            @RequestPart("noteTitle") String noteTitle,
            @Parameter(description = "노트 내용", required = true) 
            @RequestPart("noteContent") String noteContent,
            @Parameter(description = "AI 향상 여부") 
            @RequestPart(value = "aiEnhanced", required = false) String aiEnhanced,
            @Parameter(description = "원본 내용") 
            @RequestPart(value = "originalContent", required = false) String originalContent,
            @Parameter(description = "이미지 파일 리스트") 
            @RequestPart(value = "imageFiles", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        
        // DTO 생성 및 설정
        NoteCreateRequestDto noteRequestDto = new NoteCreateRequestDto();
        noteRequestDto.setNoteTitle(noteTitle);
        noteRequestDto.setNoteContent(noteContent);
        noteRequestDto.setAiEnhanced(aiEnhanced != null ? Boolean.parseBoolean(aiEnhanced) : null);
        noteRequestDto.setOriginalContent(originalContent);
        noteRequestDto.setImageFiles(imageFiles);
        
        NoteResponseDto responseDto = noteService.createNote(noteRequestDto, memberInfoDto);
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
    public ResponseEntity<NoteResponseDto> readNoteById(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                                                        @PathVariable("id") String id,
                                                        @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        NoteResponseDto responseDto = noteService.readNoteById(id, memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }

    @Operation(summary = "노트 삭제", description = "노트를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                                           @PathVariable("id") String id,
                                           @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        noteService.deleteNote(id, memberInfoDto);
        return ResponseEntity.noContent().build();
    }
    
    @Operation(summary = "노트 수정", description = "노트의 제목, 내용을 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<NoteResponseDto> updateNote(@Parameter(name = "id", example = "1", description = "복습노트 고유 아이디", required = true)
                                                      @PathVariable("id") String id,
                                                      @Valid @RequestBody NoteUpdateRequestDto noteRequestDto,
                                                      @AuthenticationPrincipal PrincipalMember memberInfoDto) {
        NoteResponseDto responseDto = noteService.updateNote(id, noteRequestDto, memberInfoDto);
        return ResponseEntity.ok(responseDto);
    }
} 