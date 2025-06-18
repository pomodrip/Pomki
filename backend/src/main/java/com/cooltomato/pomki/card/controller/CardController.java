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

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Slf4j
public class CardController {
    @Autowired
    private CardService service;

    @PostMapping
    public ResponseEntity<CardResponseDto> createCard(@RequestBody CardRequestDto request) {
        System.out.println("debug >>> CardCtrl createCard");
        service.createCardService(request);
        
        // TODO: 카드 생성 후 카드 정보 반환
        // CardResponseDto response = CardResponseDto.builder()
        // .cardId(request.getCardId())
        // .deckId(request.getDeckId())
        // .content(request.getContent())
        // .answer(request.getAnswer())
        // .build();
        // return ResponseEntity.ok(response);
        return null;
    }

    // 카드 전체 조회
    @GetMapping
    public ResponseEntity<CardResponseDto> searchAllCards(@RequestParam String deckId) {
        log.info("debug >>> CardCtrl searchAllCards");
        service.readAllCardsService(deckId);
        return null;
    }
    
} 