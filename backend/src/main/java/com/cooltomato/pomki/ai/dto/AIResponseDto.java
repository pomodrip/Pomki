package com.cooltomato.pomki.ai.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AIResponseDto {
    private Long cardId;
    private String content;
    private String answer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isDeleted;
}