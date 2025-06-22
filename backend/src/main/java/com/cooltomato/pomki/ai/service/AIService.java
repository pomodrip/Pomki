package com.cooltomato.pomki.ai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${ai.openai.api-key:}")
    private String openaiApiKey;
    
    @Value("${ai.openai.model:gpt-3.5-turbo}")
    private String openaiModel;
    
    /**
     * 노트 내용을 AI로 정리/요약
     * Phase 1: 간단한 요약 기능만
     */
    public String polishNote(String rawContent, String style) {
        if (openaiApiKey.isEmpty()) {
            log.warn("OpenAI API key not configured, returning original content");
            return rawContent; // API 키 없으면 원본 반환
        }
        
        try {
            String prompt = buildPolishPrompt(rawContent, style);
            return callOpenAI(prompt);
        } catch (Exception e) {
            log.error("AI note polishing failed: {}", e.getMessage());
            return rawContent; // 실패 시 원본 반환 (안전한 fallback)
        }
    }
    
    /**
     * 노트에서 플래시카드 생성
     * Phase 2: 시간이 되면 구현
     */
    public String generateFlashcards(String noteContent) {
        if (openaiApiKey.isEmpty()) {
            return "AI 기능이 설정되지 않았습니다.";
        }
        
        try {
            String prompt = "다음 내용을 바탕으로 학습용 플래시카드 5개를 생성해주세요:\n\n" + noteContent;
            return callOpenAI(prompt);
        } catch (Exception e) {
            log.error("AI flashcard generation failed: {}", e.getMessage());
            return "플래시카드 생성에 실패했습니다.";
        }
    }
    
    private String buildPolishPrompt(String content, String style) {
        switch (style.toLowerCase()) {
            case "summary":
                return "다음 내용을 간단히 요약해주세요:\n\n" + content;
            case "detail":
                return "다음 내용을 더 자세히 설명해주세요:\n\n" + content;
            case "concept":
                return "다음 내용의 핵심 개념들을 정리해주세요:\n\n" + content;
            default:
                return "다음 내용을 더 읽기 쉽게 정리해주세요:\n\n" + content;
        }
    }
    
    private String callOpenAI(String prompt) {
        String url = "https://api.openai.com/v1/chat/completions";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", openaiModel);
        requestBody.put("messages", new Object[]{
            Map.of("role", "user", "content", prompt)
        });
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.3);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        // 실제 API 호출은 여기서 구현
        // 시간 절약을 위해 일단 더미 응답 반환
        return "AI 처리된 내용: " + prompt.substring(0, Math.min(50, prompt.length())) + "...";
    }
} 