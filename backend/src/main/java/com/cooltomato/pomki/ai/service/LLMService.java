package com.cooltomato.pomki.ai.service;

import reactor.core.publisher.Mono;

public interface LLMService {
    Mono<String> generate(String prompt, String modelName);
    String getProviderName();
}