package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.gemini.GeminiReqDto;
import com.cooltomato.pomki.ai.entity.AIPrompt;
import com.cooltomato.pomki.ai.repository.AIPromptRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.history.service.MemberAiHistoryService; // 비용 로깅 서비스
import lombok.RequiredArgsConstructor;
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
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=";
    private final String GEMINI_API_KEY = "AIzaSyD-9tSrQWZ_y6714m1AyxFXgo60WdXIAY8";

    public GeminiResDto getAIDescription(String productName){
        String geminiURL = GEMINI_URL + GEMINI_API_KEY;
        String requestText = productName + "에 대한 상품 설명을 50자 이내로 작성해줘.";
        GeminiReqDto request = new GeminiReqDto();
        request.createGeminiReqDto(requestText);
        String description = "";
        try{
            GeminiResDto response = geminiRestTemplate.postForObject(geminiURL, request, GeminiResDto.class);
            if (response != null && response.getCandidates() != null && !response.getCandidates().isEmpty()) {
                description = response.getCandidates().get(0).getContent().getParts().get(0).getText();
            } else {
                description = "응답을 받을 수 없습니다.";
            }
        }catch (Exception e){
            log.error("Gemini API 호출 중 오류 발생: {}", e.getMessage(), e);
            description = "오류가 발생했습니다: " + e.getMessage();
        }
        return new GeminiResDto(description);
    }

    private String substituteVariables(String template, Map<String, String> variables) {
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            template = template.replace("{{" + entry.getKey() + "}}", entry.getValue());
        }
        return template;
    }
}
