package com.cooltomato.pomki.note.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NoteUpdateRequestDto {
    @NotBlank(message = "노트 제목은 비워둘 수 없습니다.")
    private String noteTitle;

    @NotBlank(message = "노트 내용은 비워둘 수 없습니다.")
    private String noteContent;

    @NotNull(message = "AI 향상 여부는 비워둘 수 없습니다.")
    private Boolean aiEnhanced;
} 