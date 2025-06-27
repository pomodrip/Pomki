package com.cooltomato.pomki.note.dto;

import com.cooltomato.pomki.note.entity.Note;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoteListResponseDto {
    private String noteId;
    private String noteTitle;
    private Boolean aiEnhanced;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoteListResponseDto from(Note note) {
        return NoteListResponseDto.builder()
                .noteId(note.getNoteId())
                .noteTitle(note.getNoteTitle())
                .aiEnhanced(note.getAiEnhanced())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
} 