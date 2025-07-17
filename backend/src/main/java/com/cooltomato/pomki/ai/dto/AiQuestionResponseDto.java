package com.cooltomato.pomki.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuestionResponseDto {
    
    private String question;
    private String answer;
    private boolean success;
    private String message;
    private LocalDateTime timestamp;
    
    public static AiQuestionResponseDto success(String question, String answer) {
        return AiQuestionResponseDto.builder()
                .question(question)
                .answer(answer)
                .success(true)
                .message("질문에 대한 답변이 생성되었습니다")
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    public static AiQuestionResponseDto failure(String question, String errorMessage) {
        return AiQuestionResponseDto.builder()
                .question(question)
                .success(false)
                .message(errorMessage)
                .timestamp(LocalDateTime.now())
                .build();
    }
} 