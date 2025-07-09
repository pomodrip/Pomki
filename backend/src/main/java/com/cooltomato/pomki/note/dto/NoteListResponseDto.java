package com.cooltomato.pomki.note.dto;

import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.noteimage.dto.NoteImageResponseDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
public class NoteListResponseDto {
    private String noteId;
    private String noteTitle;
    private Boolean aiEnhanced;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> tags;
    private boolean isBookmarked;
    private List<NoteImageResponseDto> images;

    public static NoteListResponseDto from(Note note) {
        return NoteListResponseDto.builder()
                .noteId(note.getNoteId())
                .noteTitle(note.getNoteTitle())
                .aiEnhanced(note.getAiEnhanced())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }

    public void setIsBookmarked(boolean isBookmarked) {
        this.isBookmarked = isBookmarked;
    }
    
    public void setImages(List<NoteImageResponseDto> images) {
        this.images = images;
    }
} 