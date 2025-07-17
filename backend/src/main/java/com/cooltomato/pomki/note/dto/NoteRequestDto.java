package com.cooltomato.pomki.note.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
public class NoteRequestDto {
    @NotBlank(message = "노트 제목은 필수입니다")
    @Size(max = 200, message = "노트 제목은 200자를 초과할 수 없습니다")
    private String noteTitle;
    
    @NotBlank(message = "노트 내용은 필수입니다")
    @Size(max = 5000, message = "노트 내용은 5000자를 초과할 수 없습니다")
    private String noteContent;
} 