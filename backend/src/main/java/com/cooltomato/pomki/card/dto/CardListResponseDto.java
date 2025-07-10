package com.cooltomato.pomki.card.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CardListResponseDto {
    private String deckId;
    private String deckName;
    private int totalCreated;
    private List<CardResponseDto> createdCards;
    private Long updatedCardCnt;
} 