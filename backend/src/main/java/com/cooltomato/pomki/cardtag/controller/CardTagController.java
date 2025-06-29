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

@RestController
@RequestMapping("/api/card-tag")
@RequiredArgsConstructor
@Slf4j
public class CardTagController {
    private final CardTagService service;

    @GetMapping
    public ResponseEntity<List<CardTagResponseDto>> readAllCardTag(@AuthenticationPrincipal PrincipalMember principal) {
        List<CardTagResponseDto> response = service.readAllCardTagService(principal);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CardTagResponseDto> createCardTag(@AuthenticationPrincipal PrincipalMember principal, @RequestBody CardTagRequestDto request) {
        CardTagResponseDto response = service.createCardTagService(principal, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCardTag(@AuthenticationPrincipal PrincipalMember principal, @RequestBody CardTagRequestDto request) {
        service.deleteCardTagService(principal, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tagName}")
    public ResponseEntity<List<CardResponseDto>> readCardByTagName(@AuthenticationPrincipal PrincipalMember principal, @PathVariable String tagName) {
        List<CardResponseDto> response = service.readCardByTagNameService(principal, tagName);
        return ResponseEntity.ok(response);
    }
}
