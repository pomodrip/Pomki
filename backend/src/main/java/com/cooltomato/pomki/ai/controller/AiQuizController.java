package com.cooltomato.pomki.ai.controller;

import com.cooltomato.pomki.ai.dto.GeneratedQuizDto;
import com.cooltomato.pomki.ai.dto.QuizGenerationRequestDto;
import com.cooltomato.pomki.ai.service.AiQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@Tag(name = "AI Quiz", description = "AI 퀴즈 생성 기능 API")
@RestController
@RequestMapping("/api/ai/quizzes")
@RequiredArgsConstructor
public class AiQuizController {

    private final AiQuizService aiQuizService;

    @Operation(summary = "AI 퀴즈 미리보기 생성", description = "AI를 이용해 퀴즈 미리보기를 생성합니다.")
    @PostMapping("/preview")
    public ResponseEntity<List<GeneratedQuizDto>> generateQuizPreview(@RequestBody QuizGenerationRequestDto requestDto) {
        List<GeneratedQuizDto> quizzes = aiQuizService.generateQuizPreview(requestDto);
        return ResponseEntity.ok(quizzes);
    }
} 