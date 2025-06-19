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

    // 덱 생성
    @PostMapping
    public ResponseEntity<DeckResponseDto> createDeck(@RequestBody DeckRequestDto request) {
        log.info("Creating deck with name: {}", request.getDeckName());
        DeckResponseDto response = deckService.createDeck(request);
        return ResponseEntity.ok(response);
    }

    // 특정 멤버의 모든 덱 조회
    @GetMapping("/members/{memberId}")
    public ResponseEntity<List<DeckResponseDto>> getDecksByMember(@PathVariable("memberId") Long memberId) {
        log.info("Fetching all decks for member: {}", memberId);
        List<DeckResponseDto> response = deckService.readAllDecks(memberId);
        if (response.isEmpty()) {
            log.info("No decks found for member: {}", memberId);
        }
        return ResponseEntity.ok(response);
    }
    
    // 덱 내의 모든 카드 조회
    @GetMapping("/{deckId}/cards")
    public ResponseEntity<List<CardResponseDto>> getCardsInDeck(@PathVariable("deckId") String deckId) {
        log.info("Fetching all cards in deck: {}", deckId);
        List<CardResponseDto> cardsInDeck = deckService.readAllCards(deckId);
        return ResponseEntity.ok(cardsInDeck);
    }

    // 덱 정보 수정
    @PutMapping("/{deckId}")
    public ResponseEntity<DeckResponseDto> updateDeck(@PathVariable("deckId") String deckId, @RequestBody DeckRequestDto request) {
        log.info("Updating deck: {}", deckId);
        DeckResponseDto response = deckService.updateDeck(deckId, request);
        return ResponseEntity.ok(response);
    }

    // 덱 삭제 (덱 내의 모든 카드도 함께 삭제)
    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(@PathVariable("deckId") String deckId) {
        log.info("Deleting deck: {}", deckId);
        deckService.deleteDeck(deckId);
        return ResponseEntity.noContent().build();
    }
    
    
}
