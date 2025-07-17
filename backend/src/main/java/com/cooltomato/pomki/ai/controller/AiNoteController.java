package com.cooltomato.pomki.ai.controller;

import com.cooltomato.pomki.ai.dto.NoteEnhancementRequestDto;
import com.cooltomato.pomki.ai.dto.NoteEnhancementResponseDto;
import com.cooltomato.pomki.ai.service.AiNoteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "AI Note", description = "AI 노트 향상 기능 API")
@RestController
@RequestMapping("/api/ai/notes")
@RequiredArgsConstructor
public class AiNoteController {

    private final AiNoteService aiNoteService;

    @Operation(summary = "노트 AI 향상", description = "AI를 이용해 노트 내용을 향상시킵니다.")
    @PostMapping("/enhance")
    public ResponseEntity<NoteEnhancementResponseDto> enhanceNote(@RequestBody NoteEnhancementRequestDto requestDto) {
        NoteEnhancementResponseDto response = aiNoteService.enhanceNote(requestDto);
        return ResponseEntity.ok(response);
    }
} 