package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AIRequestDto {
    private String content;
    private String answer;
}