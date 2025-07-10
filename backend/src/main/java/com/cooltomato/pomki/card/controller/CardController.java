package com.cooltomato.pomki.card.controller;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardListRequestDto;
import com.cooltomato.pomki.card.dto.CardListResponseDto;
import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.service.CardService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

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
@Tag(name = "Card", description = "카드 관리 API")
public class CardController {
    private final CardService service;

    @Operation(summary = "카드 생성", description = "특정 덱에 새로운 카드를 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "카드 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "덱을 찾을 수 없음")
    })
    @PostMapping
    public ResponseEntity<CardResponseDto> createOneCard(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "덱 ID") @RequestParam("deckId") String deckId, 
        @Parameter(description = "카드 생성 내용") @RequestBody CardRequestDto request) {
        System.out.println("debug >>> CardCtrl createCard");
        CardResponseDto createdCard = service.createOneCardService(principal, deckId, request);
        return ResponseEntity.ok(createdCard);
    }

    @Operation(summary = "배치 카드 생성", description = "특정 덱에 여러 카드를 한 번에 생성합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "배치 카드 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "덱을 찾을 수 없음")
    })
    @PostMapping("/batch")
    public ResponseEntity<CardListResponseDto> createMultipleCards(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "덱 ID") @RequestParam("deckId") String deckId, 
        @Parameter(description = "배치 카드 생성 내용") @RequestBody CardListRequestDto request) {
        System.out.println("debug >>> CardCtrl createMultipleCards");
        CardListResponseDto response = service.createMultipleCardsService(principal, deckId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "카드 조회", description = "특정 카드의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "카드 조회 성공"),
        @ApiResponse(responseCode = "404", description = "카드를 찾을 수 없음")
    })
    @GetMapping("/{cardId}")
    public ResponseEntity<CardResponseDto> readOneCard(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal,
        @Parameter(description = "카드 ID") @PathVariable("cardId") Long cardId) {
        log.info("debug >>> CardCtrl readAsingleCard 카드 한 장 내용 조회");
        CardResponseDto aCard = service.readOnecardService(principal, cardId);
        return ResponseEntity.ok(aCard);
    }

    @Operation(summary = "카드 수정", description = "기존 카드의 내용을 수정합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "카드 수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "카드를 찾을 수 없음")
    })
    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponseDto> updateOneCard(
        @Parameter(description = "카드 ID") @PathVariable("cardId") Long cardId, 
        @Parameter(description = "카드 수정 내용") @RequestBody CardRequestDto request) {
        CardResponseDto aCard = service.updateOneCardService(cardId, request);
        return ResponseEntity.ok(aCard);
    }
    
    @Operation(summary = "카드 삭제", description = "특정 카드를 삭제합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "카드 삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "카드를 찾을 수 없음")
    })
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteOneCard(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "카드 ID") @PathVariable("cardId") Long cardId) {
        service.deleteOneCardService(principal, cardId);
        return ResponseEntity.noContent().build() ;
    }

    @Operation(summary = "카드 검색", description = "키워드로 카드를 검색합니다.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    @GetMapping("/search/{keyword}")
    public ResponseEntity<List<CardResponseDto>> searchCards(
        @Parameter(description = "인증된 사용자 정보") @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "검색 키워드") @PathVariable("keyword") String keyword) {
        List<CardResponseDto> result = service.searchCardsByKeywordService(principal, keyword);
        return ResponseEntity.ok(result);
    }
} 