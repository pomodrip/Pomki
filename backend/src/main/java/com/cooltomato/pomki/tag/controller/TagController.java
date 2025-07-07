package com.cooltomato.pomki.tag.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.service.TagService;
import com.cooltomato.pomki.ai.dto.TagRecommendationRequestDto;
import com.cooltomato.pomki.ai.dto.TagRecommendationResponseDto;
import com.cooltomato.pomki.ai.service.TagRecommendationService;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tag", description = "태그 관련 API")
public class TagController {
    private final TagService service;
    private final TagRecommendationService tagRecommendationService;

    @Operation(
        summary = "카드에 태그 생성",
        description = "특정 카드에 새로운 태그를 생성합니다.",
        security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "태그 생성 성공",
            content = @Content(schema = @Schema(implementation = TagResponseDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "카드를 찾을 수 없음"
        )
    })
    @PostMapping
    public ResponseEntity<TagResponseDto> createOneTagForCard(
        @AuthenticationPrincipal PrincipalMember principal,
        @Parameter(description = "카드 ID", required = true) @RequestParam("cardId") Long cardId, 
        @Parameter(description = "태그 이름", required = true) @RequestParam("tagName") String tagName) {
        TagResponseDto response = service.createOneTagService(principal, cardId, tagName);

        return ResponseEntity.ok(response);
    }
    
    @Operation(
        summary = "태그 삭제",
        description = "특정 태그를 삭제합니다.",
        security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "204",
            description = "태그 삭제 성공"
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "태그를 찾을 수 없음"
        )
    })
    @DeleteMapping
    public ResponseEntity<Void> deleteOneTagForCard(
        @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "태그 ID", required = true) @RequestParam("tagId") Long tagId) {

        service.deleteOneTagService(principal, tagId);

        return ResponseEntity.noContent().build();
            
    }
    
    @Operation(
        summary = "내가 만든 태그 전체 조회",
        description = "현재 로그인한 사용자가 생성한 모든 태그 목록을 조회합니다.",
        security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "태그 목록 조회 성공",
            content = @Content(schema = @Schema(implementation = String.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패"
        )
    })
    @GetMapping("/my-tags")
    public ResponseEntity<List<String>> searchAllTags(@AuthenticationPrincipal PrincipalMember principal) {
        List<String> response = service.searchAllTagsService(principal);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "태그로 카드 검색",
        description = "특정 태그가 포함된 모든 카드를 조회합니다.",
        security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "카드 목록 조회 성공",
            content = @Content(schema = @Schema(implementation = CardResponseDto.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "태그를 찾을 수 없음"
        )
    })
    @GetMapping("/search/{tagName}")
    public ResponseEntity<List<CardResponseDto>> searchAllCardsByTag(
        @AuthenticationPrincipal PrincipalMember principal, 
        @Parameter(description = "검색할 태그 이름", required = true) @PathVariable("tagName") String tagName) {
        List<Card> cardsByTag = service.searchAllCardsByTagService(principal, tagName);

        List<CardResponseDto> response = cardsByTag.stream()
            .map(card -> CardResponseDto.builder()
                .cardId(card.getCardId())
                .content(card.getContent())
                .answer(card.getAnswer())
                .deckId(card.getDeck().getDeckId())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .isDeleted(card.getIsDeleted())
                .build())
            .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "AI 기반 태그 추천",
        description = "카드 내용을 기반으로 AI가 추천하는 태그 목록을 조회합니다.",
        security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "태그 추천 성공",
            content = @Content(schema = @Schema(implementation = TagRecommendationResponseDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "카드를 찾을 수 없음"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "AI 서비스 오류"
        )
    })
    @PostMapping("/ai-recommend")
    public ResponseEntity<TagRecommendationResponseDto> recommendTags(
        @AuthenticationPrincipal PrincipalMember principal,
        @Parameter(description = "태그 추천 요청 정보", required = true) 
        @Valid @RequestBody TagRecommendationRequestDto request) {
        
        TagRecommendationResponseDto response = tagRecommendationService.recommendTags(request);
        return ResponseEntity.ok(response);
    }

    @Operation(
        summary = "카드 ID로 AI 태그 추천",
        description = "카드 ID만으로 해당 카드의 내용을 분석하여 AI가 태그를 추천합니다.",
        security = @SecurityRequirement(name = "Bearer Auth")
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "태그 추천 성공",
            content = @Content(schema = @Schema(implementation = TagRecommendationResponseDto.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청"
        ),
        @ApiResponse(
            responseCode = "401",
            description = "인증 실패"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "카드를 찾을 수 없음"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "AI 서비스 오류"
        )
    })
    @PostMapping("/ai-recommend/{cardId}")
    public ResponseEntity<TagRecommendationResponseDto> recommendTagsByCardId(
        @AuthenticationPrincipal PrincipalMember principal,
        @Parameter(description = "카드 ID", required = true) @PathVariable("cardId") Long cardId) {
        
        TagRecommendationResponseDto response = tagRecommendationService.recommendTagsByCardId(cardId);
        return ResponseEntity.ok(response);
    }
    
}