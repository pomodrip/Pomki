package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class LearningGuideDto {
    private String summary;
    private List<String> nextSteps;
} 