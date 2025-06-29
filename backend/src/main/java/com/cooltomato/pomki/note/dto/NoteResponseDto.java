package com.cooltomato.pomki.note.dto;

import com.cooltomato.pomki.note.entity.Note;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponseDto {
    private String noteId;
    private Long memberId;
    private String noteTitle;
    private String noteContent;
    private Boolean aiEnhanced;
    private String originalContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
} 