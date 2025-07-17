package com.cooltomato.pomki.deck.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class DeckResponseDto {

    private LocalDateTime updatedAt;
    private String deckId;
    private String deckName;
    private LocalDateTime createdAt;
    private boolean isDeleted;
    private Long memberId;
    private Long cardCnt;
} 