package com.cooltomato.pomki.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardBookmarkDto {
    private Long cardId;
    private String cardContent;
    private String cardAnswer;
    private String deckName;
    private LocalDateTime createdAt;
} 