package com.cooltomato.pomki.card.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import com.cooltomato.pomki.card.entity.Card;

@Builder
@Getter
@Setter
public class CardResponseDto {
    private String answer;
    private String content;
    private String deckId;
    private String deckName;
    private Long cardId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDeleted;

    public static CardResponseDto from(Card card) {
        return CardResponseDto.builder()
                .cardId(card.getCardId())
                .content(card.getContent())
                .answer(card.getAnswer())
                .deckId(card.getDeck().getDeckId())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .isDeleted(card.getIsDeleted())
                .build();
    }
}
