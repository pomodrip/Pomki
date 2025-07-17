package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class NoteEnhancementResponseDto {
    private String polishedContent;
    private List<String> keywords;
    private String reasoning;
    private LearningGuideDto learningGuide;
} 