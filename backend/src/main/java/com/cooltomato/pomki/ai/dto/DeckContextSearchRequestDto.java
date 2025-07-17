package com.cooltomato.pomki.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeckContextSearchRequestDto {
    
    @NotNull(message = "덱 ID는 필수입니다")
    private String deckId;
    
    @NotBlank(message = "질문 내용은 필수입니다")
    private String question;
    
    // 검색 타입 (선택적)
    private String searchType; // "question", "concept", "summary" 등
} 