package com.cooltomato.pomki.ai.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotePolishResponseDto {
    
    private String noteId;
    private String originalContent;
    private String polishedContent;
    private String style;
    private boolean success;
    private String message;
} 