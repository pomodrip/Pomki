package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.gemini.GeminiRequestDto;
import com.cooltomato.pomki.ai.dto.gemini.GeminiResponseDto;
import com.cooltomato.pomki.ai.service.LLMService;
import com.cooltomato.pomki.global.config.AiProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service("googleGeminiService")
public class GoogleGeminiService 
implements LLMService 
{

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
        GeminiRequestDto request = new GeminiRequestDto(prompt);

        return webClient.post()
             .uri(uriBuilder -> uriBuilder
                   .path("/{modelName}:generateContent")
                   .queryParam("key", this.apiKey)
                   .build(modelName))
             .bodyValue(request)
             .retrieve()
             .bodyToMono(GeminiResponseDto.class)
             .map(response -> response.getCandidates().get(0).getContent().getParts().get(0).getText());
    }

    @Override
    public String getProviderName() {
        return "google";
    }
}