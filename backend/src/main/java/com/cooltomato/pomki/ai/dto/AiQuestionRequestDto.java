package com.cooltomato.pomki.ai.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuestionRequestDto {
    
    @NotBlank(message = "질문 내용은 필수입니다")
    @Size(max = 1000, message = "질문은 1000자 이내로 입력해주세요")
    private String question;
    
    // 질문 컨텍스트 (현재 작성 중인 노트 내용 등) - 선택사항
    @Size(max = 3000, message = "컨텍스트는 3000자 이내로 입력해주세요")
    private String context;
} 