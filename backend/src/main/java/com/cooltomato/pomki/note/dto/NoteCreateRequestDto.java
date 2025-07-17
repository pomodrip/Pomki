package com.cooltomato.pomki.note.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class NoteCreateRequestDto {
    @NotBlank(message = "노트 제목은 필수입니다.")
    private String noteTitle;

    @NotBlank(message = "노트 내용은 필수입니다.")
    private String noteContent;

    private Boolean aiEnhanced;
    private String originalContent;
    
    // 이미지 파일 리스트 (선택사항)
    private List<MultipartFile> imageFiles;
} 