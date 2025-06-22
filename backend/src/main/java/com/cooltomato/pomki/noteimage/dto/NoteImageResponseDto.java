package com.cooltomato.pomki.noteimage.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NoteImageResponseDto {

    private final Long imageId;
    private final String noteId;
    private final String imageUrl;
    private final String imageName;
    private final Long fileSize;
    private final String mimeType;
    private final LocalDateTime createdAt;
    private final String oriFileName;
    private final String resizeImageUrl;
} 