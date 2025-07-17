package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class QuizGenerationRequestDto {
    private String noteTitle;
    private String noteContent;
} 