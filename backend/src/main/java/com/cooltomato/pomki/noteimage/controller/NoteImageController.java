package com.cooltomato.pomki.noteimage.controller;

import com.cooltomato.pomki.noteimage.dto.NoteImageRequestDto;
import com.cooltomato.pomki.noteimage.dto.NoteImageResponseDto;
import com.cooltomato.pomki.noteimage.service.NoteImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Validated
@Tag(name = "Image", description = "이미지 API")
public class NoteImageController {

    private final NoteImageService noteImageService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "이미지 업로드", description = "노트에 이미지를 업로드합니다. noteId는 선택사항입니다.")
    public ResponseEntity<NoteImageResponseDto> uploadImage(
            @Parameter(description = "노트 ID (선택사항)", required = false)
            @RequestParam(value = "noteId", required = false) String noteId,
            @Parameter(description = "업로드할 이미지 파일", required = true)
            @RequestParam("imageFile") MultipartFile imageFile) {

        NoteImageRequestDto requestDto = NoteImageRequestDto.builder()
                .noteId(noteId)
                .imageFile(imageFile)
                .build();

        NoteImageResponseDto responseDto = noteImageService.uploadImage(requestDto);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/note/{noteId}")
    @Operation(summary = "노트 이미지 목록 조회", description = "특정 노트의 모든 이미지를 조회합니다.")
    public ResponseEntity<List<NoteImageResponseDto>> getImagesByNoteId(
            @Parameter(description = "노트 ID", required = true)
            @PathVariable("noteId") @NotBlank(message = "노트 ID는 필수입니다.") String noteId) {

        List<NoteImageResponseDto> images = noteImageService.readImagesByNoteId(noteId);
        return ResponseEntity.ok(images);
    }

    @DeleteMapping("/note/{noteId}")
    @Operation(summary = "노트 이미지 전체 삭제", description = "특정 노트의 모든 이미지를 삭제합니다.")
    public ResponseEntity<Void> deleteImagesByNoteId(
            @Parameter(description = "노트 ID", required = true)
            @PathVariable("noteId") @NotBlank(message = "노트 ID는 필수입니다.") String noteId) {

        noteImageService.deleteImagesByNoteId(noteId);
        return ResponseEntity.noContent().build();
    }
} 