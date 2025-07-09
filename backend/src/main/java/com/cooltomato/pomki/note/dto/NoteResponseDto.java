package com.cooltomato.pomki.note.dto;

import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.noteimage.dto.NoteImageResponseDto;
import io.swagger.v3.oas.annotations.media.Schema;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "노트 응답 데이터")
public class NoteResponseDto {
    @Schema(description = "노트 고유 ID", example = "abc123-def456-ghi789")
    private String noteId;
    
    @Schema(description = "회원 ID", example = "12345")
    private Long memberId;
    
    @Schema(description = "노트 제목", example = "Spring Boot 학습 노트")
    private String noteTitle;
    
    @Schema(description = "노트 내용", example = "Spring Boot는 자바 기반의 웹 애플리케이션 프레임워크입니다...")
    private String noteContent;
    
    @Schema(description = "AI 향상 여부", example = "false")
    private Boolean aiEnhanced;
    
    @Schema(description = "원본 내용", example = "원본 텍스트...")
    private String originalContent;
    
    @Schema(description = "생성 일시", example = "2023-12-01T10:00:00")
    private LocalDateTime createdAt;
    
    @Schema(description = "수정 일시", example = "2023-12-01T15:30:00")
    private LocalDateTime updatedAt;
    
    @Schema(description = "태그 목록", example = "[\"Spring\", \"Java\", \"Backend\"]")
    private List<String> tags;
    
    @Schema(description = "북마크 여부", example = "false")
    private boolean isBookmarked;
    
    @Schema(description = "첨부된 이미지 목록")
    private List<NoteImageResponseDto> images;

    public static NoteResponseDto from(Note note) {
        return NoteResponseDto.builder()
                .noteId(note.getNoteId())
                .noteTitle(note.getNoteTitle())
                .noteContent(note.getNoteContent())
                .aiEnhanced(note.getAiEnhanced())
                .originalContent(note.getOriginalContent())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public void setIsBookmarked(boolean isBookmarked) {
        this.isBookmarked = isBookmarked;
    }
    
    public void setImages(List<NoteImageResponseDto> images) {
        this.images = images;
    }
} 