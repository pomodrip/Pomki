package com.cooltomato.pomki.card.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.service.CardService;

import jakarta.annotation.Generated;

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
    public ResponseEntity<CardResponseDto> createCard(@RequestParam("deckId") String deckId, @RequestBody CardRequestDto request) {
        System.out.println("debug >>> CardCtrl createCard");
        CardResponseDto createdCard = service.createCardService(deckId, request);
        return ResponseEntity.ok(createdCard);
    }

    /*

    // 생성된 카드 전체 조회
    @GetMapping
    public ResponseEntity<CardResponseDto> readAllcard(@RequestParam Long memberId) {
        log.info("debug >>> CardCtrl readAllCards 모든 카드 조회");
        service.readAllcardsService(memberId);
        return null;
    }

    */

    // 카드 한 장 내용 전체 조회
    @GetMapping("/{cardId}")
    public ResponseEntity<CardResponseDto> readAsingleCard(@PathVariable("cardId") Long cardId) {
        log.info("debug >>> CardCtrl readAsingleCard 카드 한 장 내용 조회");
        CardResponseDto aCard = service.readAcardService(cardId);
        return ResponseEntity.ok(aCard);
    }

    // 카드 한 장 내용 수정
    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponseDto> updateAsingleCard(
        @PathVariable("cardId") Long cardId, @RequestBody CardRequestDto request) {
        CardResponseDto aCard = service.updateAcardService(cardId, request);
        return ResponseEntity.ok(aCard);
    }
    
    // 카드 한 장 삭제
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteAsingleCard(@PathVariable("cardId") Long cardId) {
        service.deleteAcardService(cardId);
        return ResponseEntity.noContent().build() ;
    }
    
} 