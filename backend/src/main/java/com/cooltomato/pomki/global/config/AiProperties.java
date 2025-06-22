package com.cooltomato.pomki.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@ConfigurationProperties(prefix = "ai")
@Getter
@Setter
public class AiProperties {
    private Map<String, Provider> providers;

    @Getter
    @Setter
    public static class Provider {
        private String apiKey;
        private String baseUrl;
        private Map<String, String> models;
    }
}