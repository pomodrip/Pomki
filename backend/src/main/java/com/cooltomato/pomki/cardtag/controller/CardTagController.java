package com.cooltomato.pomki.cardtag.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.cardtag.dto.CardTagRequestDto;
import com.cooltomato.pomki.cardtag.dto.CardTagResponseDto;
import com.cooltomato.pomki.cardtag.service.CardTagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Card Tag", description = "카드 태그 관련 API")
@RestController
@RequestMapping("/api/card-tag")
@RequiredArgsConstructor
@Slf4j
public class CardTagController {
    private final CardTagService service;

    // [Tag] readAllCardTag: 카드에 대한 태그 전체 조회
    @Operation(summary = "카드 태그 전체 조회", description = "카드에 대한 태그 전체를 조회합니다.")
    @GetMapping
    public ResponseEntity<List<CardTagResponseDto>> readAllCardTag(@AuthenticationPrincipal PrincipalMember principal) {
        List<CardTagResponseDto> response = service.readAllCardTagService(principal);
        return ResponseEntity.ok(response);
    }

    // [Tag] createCardTag: 카드에 태그 추가
    @Operation(summary = "카드에 태그 추가", description = "카드에 태그를 추가합니다.")
    @PostMapping
    public ResponseEntity<List<CardTagResponseDto>> createCardTag(@AuthenticationPrincipal PrincipalMember principal, @RequestBody CardTagRequestDto request) {
        List<CardTagResponseDto> response = service.createCardTagService(principal, request);
        return ResponseEntity.ok(response);
    }

    // [Tag] deleteCardTag: 카드에서 태그 삭제
    @Operation(summary = "카드에서 태그 삭제", description = "카드에서 특정 태그를 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<Void> deleteCardTag(@AuthenticationPrincipal PrincipalMember principal, @RequestParam("cardId") Long cardId, @RequestParam("tagName") String tagName) {
        service.deleteCardTagService(principal, cardId, tagName);
        return ResponseEntity.noContent().build();
    }

    // [Tag] readCardByTagName: 특정 태그 선택시 태그에 해당하는 모든 카드 조회
    @Operation(summary = "특정 태그의 카드 조회", description = "특정 태그에 해당하는 모든 카드를 조회합니다.")
    @GetMapping("/{tagName}")
    public ResponseEntity<List<CardResponseDto>> readCardByTagName(@AuthenticationPrincipal PrincipalMember principal, @PathVariable("tagName") String tagName) {
        List<CardResponseDto> response = service.readCardByTagNameService(principal, tagName);
        return ResponseEntity.ok(response);
    }
}
