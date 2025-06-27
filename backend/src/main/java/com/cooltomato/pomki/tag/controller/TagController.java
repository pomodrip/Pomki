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

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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
    
    
}