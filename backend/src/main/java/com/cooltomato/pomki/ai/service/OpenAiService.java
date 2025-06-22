package com.cooltomato.pomki.ai.service.llm;

import com.cooltomato.pomki.global.config.AiProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
//... DTOs import

@Service
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
        // OpenAI API 요청 DTO 생성
        OpenAiRequestDto request = new OpenAiRequestDto(modelName, prompt); 
        
        return webClient.post()
               .uri("/chat/completions")
               .bodyValue(request)
               .retrieve()
               .bodyToMono(OpenAiResponseDto.class)
               .map(response -> response.getChoices().get(0).getMessage().getContent());
    }

    @Override
    public String getProviderName() {
        return "openai";
    }
}