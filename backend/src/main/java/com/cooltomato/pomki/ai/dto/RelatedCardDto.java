package com.cooltomato.pomki.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatedCardDto {
    
    private Long cardId;
    private String relevance;
    private String content;
    private String answer;
    private Double relevanceScore; // 관련도 점수 (0-1)
} 