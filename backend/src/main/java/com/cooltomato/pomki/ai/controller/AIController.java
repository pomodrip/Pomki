package com.cooltomato.pomki.ai.controller;

import com.cooltomato.pomki.ai.dto.gemini.GeminiResDto;
import com.cooltomato.pomki.ai.service.AILLMService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai/test")
@RequiredArgsConstructor
public class AIController {

    private final AILLMService aiService;

    @GetMapping("/description")
    public ResponseEntity<GeminiResDto> getProductDescription(@RequestParam String productName) {
        try {
            GeminiResDto response = aiService.getAIDescription(productName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // 테스트용 에러 응답
            return ResponseEntity.internalServerError()
                    .body(new GeminiResDto("서비스 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("AI 서비스가 정상적으로 작동중입니다.");
    }
} 