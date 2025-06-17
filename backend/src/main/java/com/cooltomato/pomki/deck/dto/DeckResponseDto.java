package com.cooltomato.pomki.deck.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class DeckResponseDto {
    private String deckId;
    private String deckName;
    private LocalDateTime createdAt;
    private Long cardCnt;
} 