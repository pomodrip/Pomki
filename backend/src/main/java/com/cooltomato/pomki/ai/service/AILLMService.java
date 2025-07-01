package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.gemini.GeminiReqDto;
import com.cooltomato.pomki.ai.entity.AIPrompt;
import com.cooltomato.pomki.ai.repository.AIPromptRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.history.service.MemberAiHistoryService; // 비용 로깅 서비스
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.web.client.RestTemplate;
import com.cooltomato.pomki.ai.dto.gemini.GeminiResDto;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AILLMService {

    private final RestTemplate geminiRestTemplate;
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";

    @Value("${pomki.ai.gemini-api-key}")
    private String geminiApiKey;

    public String generateContent(String promptText) {
        String geminiURL = GEMINI_API_URL + geminiApiKey;
        GeminiReqDto request = new GeminiReqDto();
        request.createGeminiReqDto(promptText);

        try {
            GeminiResDto response = geminiRestTemplate.postForObject(geminiURL, request, GeminiResDto.class);

            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty() &&
                    response.getCandidates().get(0).getContent() != null && response.getCandidates().get(0).getContent().getParts() != null &&
                    !response.getCandidates().get(0).getContent().getParts().isEmpty()) {
                return response.getCandidates().get(0).getContent().getParts().get(0).getText();
            } else {
                log.warn("Gemini API returned an empty or invalid response structure.");
                throw new RuntimeException("Gemini API로부터 유효한 응답을 받지 못했습니다.");
            }
        } catch (Exception e) {
            log.error("Gemini API 호출 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("Gemini API 호출에 실패했습니다: " + e.getMessage(), e);
        }
    }

    public GeminiResDto getAIDescription(String productName){
        String promptText = productName + "에 대한 상품 설명을 50자 이내로 작성해줘.";
        String description = generateContent(promptText);
        return new GeminiResDto(description);
    }

    private String substituteVariables(String template, Map<String, String> variables) {
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return template;
    }
}
