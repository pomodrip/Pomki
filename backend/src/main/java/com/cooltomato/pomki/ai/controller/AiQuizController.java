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

@RestController
@RequestMapping("/api/ai/quizzes")
@RequiredArgsConstructor
public class AiQuizController {

    private final AiQuizService aiQuizService;

    @PostMapping("/preview")
    public ResponseEntity<List<GeneratedQuizDto>> generateQuizPreview(@RequestBody QuizGenerationRequestDto requestDto) {
        List<GeneratedQuizDto> quizzes = aiQuizService.generateQuizPreview(requestDto);
        return ResponseEntity.ok(quizzes);
    }
} 