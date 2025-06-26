package com.cooltomato.pomki.bookmark.dto;

import com.cooltomato.pomki.note.entity.Note;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BookmarkResponseDto {
    private String noteId;
    private String noteTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookmarkResponseDto from(Note note) {
        return BookmarkResponseDto.builder()
                .noteId(note.getNoteId())
                .noteTitle(note.getNoteTitle())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
} 