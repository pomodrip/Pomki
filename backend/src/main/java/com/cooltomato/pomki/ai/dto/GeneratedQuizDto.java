package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class GeneratedQuizDto {
    private String type;
    private String question;
    private List<String> options;
    private String answer;
} 