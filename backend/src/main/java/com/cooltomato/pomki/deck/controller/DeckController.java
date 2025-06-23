package com.cooltomato.pomki.deck.controller;

import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.service.DeckService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;

import com.cooltomato.pomki.card.dto.CardResponseDto;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.cooltomato.pomki.auth.dto.PrincipalMember;



@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
@Slf4j
public class DeckController {
    
    private final DeckService deckService;

    // 덱 생성
    // 0620 추가 ) 이제 더미데이터 멤버 777말고 로그인 정보에 따라 member_id별로 덱 생성 가능하도록 수정
    @PostMapping
    public ResponseEntity<DeckResponseDto> createOneDeck(@AuthenticationPrincipal PrincipalMember principal, @RequestBody DeckRequestDto request) {
        log.info("debug >>> DeckController createDeck");
        DeckResponseDto response = deckService.createOneDeckService(principal.getMemberId(), request);
        return ResponseEntity.ok(response);
    }

    // 특정 멤버의 모든 덱 조회
    @GetMapping("/members/my-decks")
    public ResponseEntity<List<DeckResponseDto>> readDecksByMember(@AuthenticationPrincipal PrincipalMember principal) {
        log.info("debug >>> DeckController readDecksByMember");
        List<DeckResponseDto> response = deckService.readAllDecksService(principal);
        if (response.isEmpty()) {
            log.info("No decks found for member: {}", principal.getMemberId());
        }
        return ResponseEntity.ok(response);
    }
    
    // 덱 내의 모든 카드 조회
    @GetMapping("/{deckId}/cards")
    public ResponseEntity<List<CardResponseDto>>  readCardsInAdeck(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("deckId") String deckId) {
        log.info("debug >>> DeckController readCardsInAdeck");
        List<CardResponseDto> cardsInDeck = deckService.readAllCardsService(principal, deckId);
        return ResponseEntity.ok(cardsInDeck);
    }

    // 덱 정보 수정
    @PutMapping("/{deckId}")
    public ResponseEntity<DeckResponseDto> updateOneDeck(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("deckId") String deckId, @RequestBody DeckRequestDto request) {
        log.info("Updating deck: {}", deckId);
        DeckResponseDto response = deckService.updateOneDeckSerivce(principal, deckId, request);
        return ResponseEntity.ok(response);
    }

    // 덱 삭제 (덱 내의 모든 카드도 함께 삭제)
    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("deckId") String deckId) {
        log.info("Deleting deck: {}", deckId);
        deckService.deleteOneDeckService(principal, deckId);
        return ResponseEntity.noContent().build();
    }

    // 덱에서 검색어를 입력하면 덱 안에 있는 검색어가 있는 카드들이 표시됨.
    // 여러 개의 덱에서 검출된 여러 개의 카드 결과를 볼 수 있음.
    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<CardResponseDto>> searchCardsInDeck(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("keyword") String query) {
        log.info("debug >>> DeckController searchCardsInDeck 덱 목록에서 카드 검색");
        List<CardResponseDto> cards = deckService.searchCardsInDeckService(principal, query);
        return ResponseEntity.ok(cards);
    }
    
    
}
