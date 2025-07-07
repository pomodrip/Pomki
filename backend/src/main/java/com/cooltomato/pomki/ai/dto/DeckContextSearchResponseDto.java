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
public class DeckContextSearchResponseDto {
    
    private String deckId;
    private String deckName;
    private String question;
    private String answer;
    private List<RelatedCardDto> relatedCards;
    private List<String> suggestions;
    private String confidence; // 높음/보통/낮음
    private boolean success;
    private String errorMessage;
    private Integer totalCardsAnalyzed;
    
    public static DeckContextSearchResponseDto success(String deckId, String deckName, String question, 
            String answer, List<RelatedCardDto> relatedCards, List<String> suggestions, 
            String confidence, Integer totalCards) {
        return DeckContextSearchResponseDto.builder()
                .deckId(deckId)
                .deckName(deckName)
                .question(question)
                .answer(answer)
                .relatedCards(relatedCards)
                .suggestions(suggestions)
                .confidence(confidence)
                .totalCardsAnalyzed(totalCards)
                .success(true)
                .build();
    }
    
    public static DeckContextSearchResponseDto failure(String deckId, String question, String errorMessage) {
        return DeckContextSearchResponseDto.builder()
                .deckId(deckId)
                .question(question)
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
} 