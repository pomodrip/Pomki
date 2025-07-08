package com.cooltomato.pomki.card.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardResponseDto {
    private String answer;
    private String content;
    private String deckId;
    private String deckName;
    private Long cardId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDeleted;
    private List<String> tags;
    private boolean isBookmarked;
}
