package com.cooltomato.pomki.ai.controller;

import com.cooltomato.pomki.ai.dto.NotePolishRequestDto;
import com.cooltomato.pomki.ai.dto.NotePolishResponseDto;
import com.cooltomato.pomki.ai.service.AIService;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.dto.NoteUpdateRequestDto;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.service.NoteService;
import com.cooltomato.pomki.auth.dto.PrincipalMember;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {
    
    private final AIService aiService;
    private final NoteService noteService;
    
    /**
     * 노트 내용을 AI로 폴리싱
     */
    @PostMapping("/polish-note")
    public ResponseEntity<NotePolishResponseDto> polishNote(
            @Valid @RequestBody NotePolishRequestDto request,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        try {
            // 노트 조회 및 권한 확인
            NoteResponseDto noteResponse = noteService.readNoteById(request.getNoteId(), principalMember);
            
            // AI 폴리싱 실행
            String originalContent = noteResponse.getNoteContent();
            String customPrompt = request.getCustomPrompt();
            String prompt = (customPrompt != null && !customPrompt.trim().isEmpty()) 
                ? customPrompt : request.getStyle();
                
            String polishedContent = aiService.polishNote(originalContent, prompt);
            
            return ResponseEntity.ok(
                NotePolishResponseDto.builder()
                    .noteId(request.getNoteId())
                    .originalContent(originalContent)
                    .polishedContent(polishedContent)
                    .style(request.getStyle())
                    .success(true)
                    .message("노트 폴리싱이 완료되었습니다")
                    .build());
                    
        } catch (Exception e) {
            log.error("Note polishing failed for noteId: {}", request.getNoteId(), e);
            return ResponseEntity.internalServerError()
                .body(NotePolishResponseDto.builder()
                    .noteId(request.getNoteId())
                    .success(false)
                    .message("노트 폴리싱 중 오류가 발생했습니다: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * 폴리싱된 내용으로 노트 업데이트
     */
    @PostMapping("/apply-polish/{noteId}")
    public ResponseEntity<String> applyPolish(
            @PathVariable String noteId,
            @RequestBody String polishedContent,
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        try {
            // 노트 조회 및 권한 확인
            NoteResponseDto noteResponse = noteService.readNoteById(noteId, principalMember);
            
            // 노트 업데이트 (제목은 기존 것 유지, 내용만 변경)
            NoteUpdateRequestDto updateDto = new NoteUpdateRequestDto();
            updateDto.setNoteTitle(noteResponse.getNoteTitle());
            updateDto.setNoteContent(polishedContent);
            updateDto.setAiEnhanced(true);
            noteService.updateNote(noteId, updateDto, principalMember);
            
            return ResponseEntity.ok("노트가 성공적으로 업데이트되었습니다");
            
        } catch (Exception e) {
            log.error("Apply polish failed for noteId: {}", noteId, e);
            return ResponseEntity.internalServerError()
                .body("노트 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * AI 기능 사용 가능 여부 확인
     */
    @GetMapping("/status")
    public ResponseEntity<Object> getAIStatus() {
        return ResponseEntity.ok(new Object() {
            public final boolean available = !aiService.toString().contains("not configured");
            public final String message = available ? "AI 기능이 사용 가능합니다" : "AI 기능을 사용하려면 API 키를 설정해주세요";
        });
    }
}