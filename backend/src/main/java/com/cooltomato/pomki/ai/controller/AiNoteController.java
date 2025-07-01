package com.cooltomato.pomki.ai.controller;

import com.cooltomato.pomki.ai.dto.NoteEnhancementRequestDto;
import com.cooltomato.pomki.ai.dto.NoteEnhancementResponseDto;
import com.cooltomato.pomki.ai.service.AiNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/notes")
@RequiredArgsConstructor
public class AiNoteController {

    private final AiNoteService aiNoteService;

    @PostMapping("/enhance")
    public ResponseEntity<NoteEnhancementResponseDto> enhanceNote(@RequestBody NoteEnhancementRequestDto requestDto) {
        NoteEnhancementResponseDto response = aiNoteService.enhanceNote(requestDto);
        return ResponseEntity.ok(response);
    }
} 