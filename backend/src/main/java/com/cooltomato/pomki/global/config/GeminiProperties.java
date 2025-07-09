package com.cooltomato.pomki.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "gemini")
@Getter
@Setter
public class GeminiProperties {
    private Api api;
    
    @Getter
    @Setter
    public static class Api {
        private String key;
        private String baseUrl;
        private Map<String, String> models;
        private String defaultModel;
        private Double temperature;
        private Integer maxTokens;
    }
} 