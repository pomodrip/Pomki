package com.cooltomato.pomki.card.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CardReviewRequestDto {
    private Long cardId;
    private String difficulty;
} 