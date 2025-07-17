package com.cooltomato.pomki.ai.dto.gemini;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerationConfig {

    @JsonProperty("max_output_tokens")
    private Integer maxOutputTokens;

    private Double temperature;
} 