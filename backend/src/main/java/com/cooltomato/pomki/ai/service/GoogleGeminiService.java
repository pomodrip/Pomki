package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.gemini.GeminiRequestDto;
import com.cooltomato.pomki.ai.dto.gemini.GeminiResponseDto;
import com.cooltomato.pomki.ai.service.LLMService;
import com.cooltomato.pomki.global.config.AiProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service("googleGeminiService")
public class GoogleGeminiService implements LLMService {

    private final WebClient webClient;
    private final String apiKey;

    public GoogleGeminiService(WebClient.Builder webClientBuilder, AiProperties aiProperties) {
        AiProperties.Provider provider = aiProperties.getProviders().get("google");
        this.apiKey = provider.getApiKey();
        this.webClient = webClientBuilder
             .baseUrl(provider.getBaseUrl())
             .build();
    }

    @Override
    public Mono<String> generate(String prompt, String modelName) {
        // TODO: 임시로 기본 응답 반환 - 향후 구현 예정
        return Mono.just("Google Gemini 서비스는 구현 예정입니다: " + prompt.substring(0, Math.min(50, prompt.length())));
    }

    @Override
    public String getProviderName() {
        return "google";
    }
}