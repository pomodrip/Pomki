package com.cooltomato.pomki.deck.controller;

import com.cooltomato.pomki.card.entity.CardEntity;
import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.entity.DeckEntity;
import com.cooltomato.pomki.deck.service.DeckService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
public class DeckController {
    
    private final DeckService deckService;

    // 덱 생성. 프론트에서 전달 필요
    // 나중에 memberId만 @RequestAttribute로 받아오기
    @PostMapping
    public ResponseEntity<DeckResponseDto> createDeck(
        @RequestBody DeckRequestDto request) {
        System.out.println("debug >>> DeckCtrl createDeck");
        DeckResponseDto response = deckService.createDeck(request.getDeckName());
        return ResponseEntity.ok(response);
    }

    // 나중에 memberId만 @RequestAttribute로 받아오기
    // 덱 전체 조회
    @GetMapping
    public ResponseEntity<List<DeckEntity>> searchAllDecks(@RequestParam("memberId") Long memberId) {
        System.out.println("debug >>> DeckCtrl searchAllDecks");
        System.out.println("debug >>> memberId: " + memberId);
        List<DeckEntity> response = deckService.searchAllDecks(memberId);
        if (response.size() == 0) {
            System.out.println("덱이 존재하지 않습니다.");
        }
        // 프론트와 상의해서 코드 수정
        return ResponseEntity.ok(response);
    }
    

    // 덱 안 카드 전체 조회
    @GetMapping("/all-cards")
    public ResponseEntity<List<CardEntity>> allCardsInAdeck(@RequestParam("deckId") String deckId) {
        System.out.println("debug >>> DeckCtrl allCardsInAdeck");
        System.out.println("debug >>> deckId: " + deckId);
        deckService.searchAllCardsInAdeck(deckId) ;
        return null;
    }
    
    
}
