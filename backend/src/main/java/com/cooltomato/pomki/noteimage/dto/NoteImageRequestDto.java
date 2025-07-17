package com.cooltomato.pomki.noteimage.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
public class NoteImageRequestDto {

    private String noteId; // null 허용

    @NotNull(message = "이미지 파일은 필수입니다.")
    private MultipartFile imageFile;

    @Builder
    public NoteImageRequestDto(String noteId, MultipartFile imageFile) {
        this.noteId = noteId;
        this.imageFile = imageFile;
    }
} 