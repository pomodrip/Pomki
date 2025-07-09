package com.cooltomato.pomki.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagRecommendationResponseDto {
    
    private Long cardId;
    private List<String> recommendedTags;
    private String reasoning;
    private boolean success;
    private String errorMessage;
    
    public static TagRecommendationResponseDto success(Long cardId, List<String> tags, String reasoning) {
        return TagRecommendationResponseDto.builder()
                .cardId(cardId)
                .recommendedTags(tags)
                .reasoning(reasoning)
                .success(true)
                .build();
    }
    
    public static TagRecommendationResponseDto failure(Long cardId, String errorMessage) {
        return TagRecommendationResponseDto.builder()
                .cardId(cardId)
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
} 