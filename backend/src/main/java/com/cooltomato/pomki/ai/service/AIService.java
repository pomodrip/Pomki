package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.entity.AIPrompt;
import com.cooltomato.pomki.ai.repository.AIPromptRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.history.service.MemberAiHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    // private final AIPromptRepository aiPromptRepository;
    private final MemberRepository memberRepository;
    private final MemberAiHistoryService memberAiHistoryService;
    private final GoogleGeminiService googleGeminiService;
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
    
    /**
     * 사용자 질문에 AI로 답변 (Gemini 사용)
     * 노트 작성 중 궁금한 내용을 질문하면 답변 제공 
     */
    public String answerQuestion(String question, String context) {
        try {
            log.info("Answering question with Gemini: {}", question.substring(0, Math.min(50, question.length())));
            return googleGeminiService.answerQuestion(question, context);
        } catch (Exception e) {
            log.error("AI question answering failed: {}", e.getMessage());
            throw new RuntimeException("AI 답변 생성에 실패했습니다: " + e.getMessage());
        }
    }
    
    private String buildPolishPrompt(String content, String style) {
        switch (style.toLowerCase()) {
            case "summary":
                return "다음 학습 노트를 3-5줄로 간단히 요약해주세요. 핵심 포인트만 포함하세요:\n\n" + content;
            case "detail":
                return "다음 학습 노트의 내용을 더 자세히 설명해주세요. 예시나 부연설명을 추가해주세요:\n\n" + content;
            case "concept":
                return "다음 학습 노트에서 핵심 개념들을 불릿 포인트로 정리해주세요. 각 개념에 대해 간단한 설명도 포함하세요:\n\n" + content;
            case "clean":
                return "다음 학습 노트의 맞춤법과 문법을 교정하고, 읽기 쉽게 문장을 다듬어주세요. 내용은 변경하지 말고 표현만 개선해주세요:\n\n" + content;
            default:
                return "다음 학습 노트를 더 읽기 쉽고 이해하기 쉽게 정리해주세요:\n\n" + content;
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
            Map.of("role", "system", "content", "당신은 학습 노트를 정리하고 개선하는 전문가입니다. 사용자의 요청에 따라 노트를 요약, 확장, 개념 정리, 문법 교정 등을 수행합니다."),
            Map.of("role", "user", "content", prompt)
        });
        requestBody.put("max_tokens", 2000);
        requestBody.put("temperature", 0.3);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    return (String) message.get("content");
                }
            }
            
            log.warn("OpenAI API returned unexpected format");
            return "AI 응답 형식이 예상과 다릅니다.";
            
        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage());
            throw new RuntimeException("AI 서비스 호출 실패: " + e.getMessage());
        }
    }
} 