package com.cooltomato.pomki.card.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class CardResponseDto {
    private String answer;
    private String content;
    private String deckId;
    private Long cardId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDeleted;

}
