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
public class TagRecommendationRequestDto {
    
    @NotNull(message = "카드 ID는 필수입니다")
    private Long cardId;
    
    @NotBlank(message = "카드 내용은 필수입니다")
    private String cardContent;
    
    @NotBlank(message = "카드 답변은 필수입니다")
    private String cardAnswer;
} 