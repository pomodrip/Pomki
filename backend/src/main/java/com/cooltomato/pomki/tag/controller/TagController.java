package com.cooltomato.pomki.tag.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.tag.dto.TagRequestDto;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.service.TagService;

import java.net.ResponseCache;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService service;

    @PostMapping
    public ResponseEntity<TagResponseDto> createOneTagForCard(@AuthenticationPrincipal PrincipalMember principal, @RequestParam("cardId") Long cardId, @RequestParam("tagName") String tagName) {
        TagResponseDto response = service.createOneTagService(principal, cardId, tagName);

        return ResponseEntity.ok(response);
    }
    
} 