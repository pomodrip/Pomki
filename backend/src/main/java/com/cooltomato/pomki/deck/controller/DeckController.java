package com.cooltomato.pomki.deck.controller;

import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.service.DeckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.cooltomato.pomki.card.dto.CardResponseDto;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
@Slf4j
public class DeckController {
    
    private final DeckService deckService;

    // 덱 생성. 프론트에서 전달 필요
    // 나중에 memberId만 @RequestAttribute로 받아오기
    @PostMapping
    public ResponseEntity<DeckResponseDto> createDeck(
        @RequestBody DeckRequestDto request) {
        System.out.println("debug >>> DeckCtrl createDeck");
        System.out.println("debug >>>> deckName:" + request.getDeckName());
        DeckResponseDto response = deckService.createDeck(request);
        return ResponseEntity.ok(response);
    }

    // 나중에 memberId만 @RequestAttribute로 받아오기
    // 덱 전체 조회. 멤버별로 생성한 덱을 모두 볼 수 있다
    @GetMapping
    public ResponseEntity<List<DeckResponseDto>> readAllDecks(@PathVariable("memberId") Long memberId) {
        System.out.println("debug >>> DeckCtrl searchAllDecks");
        System.out.println("debug >>> memberId: " + memberId);
        List<DeckResponseDto> response = deckService.readAllDecks(memberId);
        if (response.isEmpty()) {
            System.out.println("덱이 존재하지 않습니다.");
        }
        return ResponseEntity.ok(response);
    }
    
    // 작업 중
    // 덱 안 카드 전체 조회
    @GetMapping("/{deckId}")
    public ResponseEntity<List<CardResponseDto>> readAllCardInAdeck(@PathVariable("deckId") String deckId) {
        log.info("debug >>> DeckCtrl readAllCardInAdeck");
        log.info("debug >>> deckId: " + deckId);
        List<CardResponseDto> cardsInAdeck = deckService.readAllCards(deckId) ;
        return ResponseEntity.ok(cardsInAdeck);
    }

    // 덱 이름 수정
    @PutMapping("/{deckId}")
    public ResponseEntity<DeckResponseDto> updateDeck(@PathVariable("deckId") String deckId, @RequestBody DeckRequestDto request) {
        DeckResponseDto response = deckService.updateDeck(deckId, request);
        return ResponseEntity.ok(response);
    }

    // 덱 삭제. 삭제할 시 덱 안 카드도 같이 삭제
    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(@PathVariable("deckId") String deckId) {
        deckService.deleteDeck(deckId);
        return ResponseEntity.noContent().build();
    }
    
    
}
