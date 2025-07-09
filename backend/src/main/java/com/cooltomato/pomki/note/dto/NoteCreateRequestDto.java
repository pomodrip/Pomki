package com.cooltomato.pomki.note.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Schema(description = "노트 생성 요청 데이터")
public class NoteCreateRequestDto {
    @Schema(description = "노트 제목", example = "Spring Boot 학습 노트", required = true)
    @NotBlank(message = "노트 제목은 비워둘 수 없습니다.")
    private String noteTitle;

    @Schema(description = "노트 내용", example = "Spring Boot는 자바 기반의 웹 애플리케이션 프레임워크입니다...", required = true)
    @NotBlank(message = "노트 내용은 비워둘 수 없습니다.")
    private String noteContent;

    @Schema(description = "AI 향상 여부", example = "false")
    private Boolean aiEnhanced;
    
    @Schema(description = "원본 내용", example = "원본 텍스트...")
    private String originalContent;
} 