package com.cooltomato.pomki.ai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cooltomato.pomki.ai.dto.AIRequestDto;
import com.cooltomato.pomki.ai.dto.AIResponseDto;
import com.cooltomato.pomki.ai.service.AIService;
import com.cooltomato.pomki.auth.dto.PrincipalMember;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/ai")
public class AIController {
    
    private final AIService aiService;

    // 카드 한 장 생성
    @PostMapping("/{deckId}")
    public ResponseEntity<AIResponseDto> createOneCard(@AuthenticationPrincipal PrincipalMember principal, @PathVariable String deckId, @RequestBody AIRequestDto request) {
        log.info("debug >>> AIController createOneCard 카드 한 장 생성");
        AIResponseDto response = aiService.createOneCardService(principal, deckId, request);
        return ResponseEntity.created(null).body(response);
    }
    
    // 카드 한 장 조회
    @GetMapping("/{cardId}")
    public ResponseEntity<AIResponseDto> readOneCard(@PathVariable Long cardId) {
        log.info("debug >>> AIController readOneCard 카드 한 장 조회");
        AIResponseDto response = aiService.readOnecardService(cardId);
        return ResponseEntity.ok(response);
    }
    
    // 카드 한 장 수정
    @PutMapping("/{cardId}")
    public ResponseEntity<AIResponseDto> updateOneCard(@PathVariable Long cardId, @RequestBody AIRequestDto request) {
        log.info("debug >>> AIController updateOneCard 카드 한 장 수정");
        AIResponseDto response = aiService.updateOneCardService(cardId, request);
        return ResponseEntity.ok(response);
    }
    
    // 카드 한 장 삭제
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteOneCard(@AuthenticationPrincipal PrincipalMember principal, @PathVariable Long cardId) {
        log.info("debug >>> AIController deleteOneCard 카드 한 장 삭제");
        aiService.deleteOnecardService(principal, cardId);
        return ResponseEntity.noContent().build();
    }
}
