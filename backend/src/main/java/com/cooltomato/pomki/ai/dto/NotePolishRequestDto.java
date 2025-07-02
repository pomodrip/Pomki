package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NotePolishRequestDto {
    
    @NotBlank(message = "노트 ID는 필수입니다")
    private String noteId;
    
    @NotBlank(message = "폴리싱 스타일은 필수입니다")
    private String style; // summary, detail, concept, clean
    
    private String customPrompt; // 사용자 커스텀 프롬프트 (선택사항)
} 