package com.cooltomato.pomki.ai.service; //.llm;

import com.cooltomato.pomki.ai.dto.openai.OpenAiRequestDto;
import com.cooltomato.pomki.ai.dto.openai.OpenAiResponseDto;
import com.cooltomato.pomki.ai.service.LLMService;
import com.cooltomato.pomki.global.config.AiProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service("openAiService")
public class OpenAiService implements LLMService {

    private final WebClient webClient;

    public OpenAiService(WebClient.Builder webClientBuilder, AiProperties aiProperties) {
        AiProperties.Provider provider = aiProperties.getProviders().get("openai");
        this.webClient = webClientBuilder
             .baseUrl(provider.getBaseUrl())
             .defaultHeader("Authorization", "Bearer " + provider.getApiKey())
             .build();
    }

    @Override
    public Mono<String> generate(String prompt, String modelName) {
        // TODO: 임시로 기본 응답 반환 - 향후 구현 예정
        return Mono.just("OpenAI 서비스는 구현 예정입니다: " + prompt.substring(0, Math.min(50, prompt.length())));
    }

    @Override
    public String getProviderName() {
        return "openai";
    }
}