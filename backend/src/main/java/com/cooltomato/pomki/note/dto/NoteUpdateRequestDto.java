package com.cooltomato.pomki.note.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "노트 수정 요청 데이터")
public class NoteUpdateRequestDto {
    @Schema(description = "노트 제목", example = "수정된 Spring Boot 학습 노트", required = true)
    @NotBlank(message = "노트 제목은 비워둘 수 없습니다.")
    private String noteTitle;

    @Schema(description = "노트 내용", example = "수정된 Spring Boot 내용입니다...", required = true)
    @NotBlank(message = "노트 내용은 비워둘 수 없습니다.")
    private String noteContent;

    @Schema(description = "AI 향상 여부", example = "true", required = true)
    @NotNull(message = "AI 향상 여부는 비워둘 수 없습니다.")
    private Boolean aiEnhanced;
    
    @Schema(description = "삭제할 이미지 ID 목록", example = "[1, 2, 3]")
    private List<Long> deleteImageIds;
} 