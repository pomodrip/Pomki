package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.gemini.GeminiReqDto;
import com.cooltomato.pomki.ai.dto.gemini.GeminiResDto;
import com.cooltomato.pomki.ai.service.LLMService;
import com.cooltomato.pomki.global.config.GeminiProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service("googleGeminiService")
@Slf4j
public class GoogleGeminiService implements LLMService {

    private final WebClient webClient;
    private final String apiKey;
    private final String defaultModel;

    public GoogleGeminiService(WebClient.Builder webClientBuilder, GeminiProperties geminiProperties) {
        this.apiKey = geminiProperties.getApi().getKey();
        this.defaultModel = geminiProperties.getApi().getDefaultModel();
        this.webClient = webClientBuilder
             .baseUrl(geminiProperties.getApi().getBaseUrl())
             .build();
        
        log.info("GoogleGeminiService initialized with base URL: {}", geminiProperties.getApi().getBaseUrl());
    }

    @Override
    public Mono<String> generate(String prompt, String modelName) {
        if (apiKey == null || apiKey.isEmpty()) {
            log.warn("Google Gemini API key not configured");
            return Mono.error(new RuntimeException("Google Gemini API 키가 설정되지 않았습니다"));
        }

        try {
            // Gemini 요청 DTO 생성
            GeminiReqDto requestDto = new GeminiReqDto();
            requestDto.createGeminiReqDto(prompt);

            // 모델명 기본값 설정
            String model = (modelName != null && !modelName.isEmpty()) ? modelName : defaultModel;
            
            log.debug("Calling Gemini API with model: {}", model);

            // API 호출 - URL 중복 문제 해결
            return webClient.post()
                    .uri("/{model}:generateContent?key={apiKey}", model, apiKey)
                    .bodyValue(requestDto)
                    .retrieve()
                    .bodyToMono(GeminiResDto.class)
                    .map(this::extractTextFromResponse)
                    .doOnSuccess(response -> log.debug("Gemini API call successful"))
                    .doOnError(error -> log.error("Gemini API call failed: {}", error.getMessage()));

        } catch (Exception e) {
            log.error("Error creating Gemini request: {}", e.getMessage());
            return Mono.error(new RuntimeException("Google Gemini 요청 생성 실패: " + e.getMessage()));
        }
    }

    @Override
    public String getProviderName() {
        return "google";
    }

    /**
     * Gemini 응답에서 실제 텍스트 추출
     */
    private String extractTextFromResponse(GeminiResDto response) {
        if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
            throw new RuntimeException("Gemini API로부터 빈 응답을 받았습니다");
        }

        try {
            GeminiResDto.Candidate candidate = response.getCandidates().get(0);
            if (candidate.getContent() == null || candidate.getContent().getParts() == null 
                || candidate.getContent().getParts().isEmpty()) {
                throw new RuntimeException("Gemini 응답 형식이 올바르지 않습니다");
            }

            return candidate.getContent().getParts().get(0).getText();
        } catch (Exception e) {
            log.error("Error extracting text from Gemini response: {}", e.getMessage());
            throw new RuntimeException("Gemini 응답 파싱 실패: " + e.getMessage());
        }
    }

    /**
     * 동기식 답변 생성 (질문 답변용)
     */
    public String answerQuestion(String question, String context) {
        // 질문을 위한 프롬프트 생성
        String prompt = buildQuestionPrompt(question, context);
        
        // 기본 모델 사용
        return generate(prompt, defaultModel)
                .block(); // 동기식 처리
    }

    /**
     * 질문 답변용 프롬프트 생성
     */
    private String buildQuestionPrompt(String question, String context) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("당신은 학습을 도와주는 친절한 AI 튜터입니다. ");
        prompt.append("사용자의 질문에 대해 정확하고 이해하기 쉽게 한국어로 답변해주세요.\n\n");
        
        // 컨텍스트가 있는 경우 추가
        if (context != null && !context.trim().isEmpty()) {
            prompt.append("현재 학습 중인 내용: ").append(context).append("\n\n");
        }
        
        // 사용자 질문
        prompt.append("질문: ").append(question).append("\n\n");
        prompt.append("답변:");
        
        return prompt.toString();
    }
}