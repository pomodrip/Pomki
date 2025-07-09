package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.GeneratedQuizDto;
import com.cooltomato.pomki.ai.dto.QuizGenerationRequestDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiQuizService {

    private final AILLMService aillmService;
    private final ObjectMapper objectMapper;

    public List<GeneratedQuizDto> generateQuizPreview(QuizGenerationRequestDto requestDto) {
        try {
            String promptTemplate = loadPrompt("prompts/QuizGenerationv2.txt");

            String title = requestDto.getNoteTitle() != null ? requestDto.getNoteTitle() : "";
            String content = requestDto.getNoteContent();

            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("노트 내용이 비어있습니다.");
            }

            String prompt = promptTemplate
                    .replace("{NOTE_TITLE}", title)
                    .replace("{NOTE_CONTENT}", content);

            String jsonResponse = aillmService.generateContent(prompt);

            // Clean the response from markdown code blocks if present
            jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();

            return objectMapper.readValue(jsonResponse, new TypeReference<List<GeneratedQuizDto>>() {});

        } catch (Exception e) {
            log.error("AI 퀴즈 생성 중 오류 발생", e);
            throw new RuntimeException("AI 퀴즈를 생성하는 데 실패했습니다.", e);
        }
    }

    private String loadPrompt(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            try (InputStream inputStream = resource.getInputStream()) {
                return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            log.error("프롬프트 파일을 불러오는 데 실패했습니다: {}", path, e);
            throw new RuntimeException("필요한 프롬프트 파일을 불러올 수 없습니다.", e);
        }
    }
} 