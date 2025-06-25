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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;



@RestController
@RequestMapping("/api/decks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Deck", description = "덱 관리 API")
public class DeckController {
    
    private final DeckService deckService;

    @Operation(summary = "덱 생성", description = "새로운 덱을 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "덱 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @PostMapping
    public ResponseEntity<DeckResponseDto> createOneDeck(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "덱 제목") @RequestBody DeckRequestDto request) {
        log.info("debug >>> DeckController createDeck");
        DeckResponseDto response = deckService.createOneDeckService(principal.getMemberId(), request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "내 덱 목록 조회", description = "현재 로그인한 사용자의 모든 덱을 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "덱 목록 조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/members/my-decks")
    public ResponseEntity<List<DeckResponseDto>> readDecksByMember(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal) {
        log.info("debug >>> DeckController readDecksByMember");
        List<DeckResponseDto> response = deckService.readAllDecksService(principal);
        if (response.isEmpty()) {
            log.info("No decks found for member: {}", principal.getMemberId());
        }
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "덱 내 카드 목록 조회", description = "특정 덱에 포함된 모든 카드를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "카드 목록 조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "덱을 찾을 수 없음")
    })
    @GetMapping("/{deckId}/cards")
    public ResponseEntity<List<CardResponseDto>> readCardsInAdeck(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "덱 ID") @PathVariable("deckId") String deckId) {
        log.info("debug >>> DeckController readCardsInAdeck");
        List<CardResponseDto> cardsInDeck = deckService.readAllCardsService(principal, deckId);
        return ResponseEntity.ok(cardsInDeck);
    }

    @Operation(summary = "덱 제목 수정", description = "기존 덱의 정보를 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "덱 수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "덱을 찾을 수 없음")
    })
    @PutMapping("/{deckId}")
    public ResponseEntity<DeckResponseDto> updateOneDeck(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "덱 ID") @PathVariable("deckId") String deckId, 
        @Parameter(description = "덱 수정 요청 정보") @RequestBody DeckRequestDto request) {
        log.info("Updating deck: {}", deckId);
        DeckResponseDto response = deckService.updateOneDeckSerivce(principal, deckId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "덱 삭제", description = "덱과 덱 내의 모든 카드를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "덱 삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "덱을 찾을 수 없음")
    })
    @DeleteMapping("/{deckId}")
    public ResponseEntity<Void> deleteDeck(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "덱 ID") @PathVariable("deckId") String deckId) {
        log.info("Deleting deck: {}", deckId);
        deckService.deleteOneDeckService(principal, deckId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "덱 내 카드 검색", description = "사용자의 모든 덱에서 키워드로 카드를 검색합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<CardResponseDto>> searchCardsInDeck(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "검색 키워드") @PathVariable("keyword") String query, @RequestParam("deckId") String deckId) {
        log.info("debug >>> DeckController searchCardsInDeck 덱 목록에서 카드 검색");
        List<CardResponseDto> cards = deckService.searchCardsInDeckService(principal, query, deckId);
        return ResponseEntity.ok(cards);
    }
}
