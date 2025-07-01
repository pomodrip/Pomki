package com.cooltomato.pomki.ai.service;

import com.cooltomato.pomki.ai.dto.NoteEnhancementRequestDto;
import com.cooltomato.pomki.ai.dto.NoteEnhancementResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.nio.file.Files;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiNoteService {

    private final AILLMService aillmService;
    private final ObjectMapper objectMapper;

    public NoteEnhancementResponseDto enhanceNote(NoteEnhancementRequestDto requestDto) {
        try {
            String promptTemplate = loadPrompt("classpath:prompts/NoteEnhancementDetailed.txt");

            String title = requestDto.getNoteTitle() != null ? requestDto.getNoteTitle() : "";
            String content = requestDto.getNoteContent();

            if (content == null || content.trim().isEmpty()) {
                throw new IllegalArgumentException("노트 내용이 비어있습니다.");
            }

            String prompt = promptTemplate
                    .replace("{noteTitle}", title)
                    .replace("{noteContent}", content);

            String jsonResponse = aillmService.generateContent(prompt);

            jsonResponse = jsonResponse.replace("```json", "").replace("```", "").trim();

            return objectMapper.readValue(jsonResponse, NoteEnhancementResponseDto.class);

        } catch (Exception e) {
            log.error("AI 노트 강화 중 오류 발생", e);
            throw new RuntimeException("AI 노트를 강화하는 데 실패했습니다.", e);
        }
    }

    private String loadPrompt(String path) {
        try {
            File file = ResourceUtils.getFile(path);
            return new String(Files.readAllBytes(file.toPath()));
        } catch (Exception e) {
            log.error("프롬프트 파일을 불러오는 데 실패했습니다: {}", path, e);
            throw new RuntimeException("필요한 프롬프트 파일을 불러올 수 없습니다.", e);
        }
    }
} 