package com.cooltomato.pomki.card.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.service.CardService;


import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;



@RestController
@RequestMapping("/api/card")
@RequiredArgsConstructor
@Slf4j
public class CardController {
    private final CardService service;

    // 카드 한 장 생성
    @PostMapping
    public ResponseEntity<CardResponseDto> createOneCard(@AuthenticationPrincipal PrincipalMember principal, @RequestParam("deckId") String deckId, @RequestBody CardRequestDto request) {
        System.out.println("debug >>> CardCtrl createCard");
        CardResponseDto createdCard = service.createOneCardService(principal, deckId, request);
        return ResponseEntity.ok(createdCard);
    }


    // 카드 한 장 내용 전체 조회
    @GetMapping("/{cardId}")
    public ResponseEntity<CardResponseDto> readOneCard(@PathVariable("cardId") Long cardId) {
        log.info("debug >>> CardCtrl readAsingleCard 카드 한 장 내용 조회");
        CardResponseDto aCard = service.readOnecardService(cardId);
        return ResponseEntity.ok(aCard);
    }

    // 카드 한 장 내용 수정
    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponseDto> updateOneCard(
        @PathVariable("cardId") Long cardId, @RequestBody CardRequestDto request) {
        CardResponseDto aCard = service.updateOneCardService(cardId, request);
        return ResponseEntity.ok(aCard);
    }
    
    // 카드 한 장 삭제
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteOneCard(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("cardId") Long cardId) {
        service.deleteOnecardService(principal, cardId);
        return ResponseEntity.noContent().build() ;
    }

    // 카드 검색
    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<CardResponseDto>> searchCards(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("keyword") String keyword) {
        List<CardResponseDto> result = service.searchCardsByKeywordService(principal, keyword);
        return ResponseEntity.ok(result);
    }
} 