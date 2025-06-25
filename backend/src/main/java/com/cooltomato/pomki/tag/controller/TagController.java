package com.cooltomato.pomki.tag.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import lombok.RequiredArgsConstructor;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.service.TagService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {
    private final TagService service;

    // 태그 생성
    @PostMapping
    public ResponseEntity<TagResponseDto> createOneTagForCard(
        @AuthenticationPrincipal PrincipalMember principal,
        @RequestParam("cardId") Long cardId, @RequestParam("tagName") String tagName) {
        TagResponseDto response = service.createOneTagService(principal, cardId, tagName);

        return ResponseEntity.ok(response);
    }
    
    // 태그 삭제
    @DeleteMapping
    public ResponseEntity<Void> deleteOneTagForCard(
        @AuthenticationPrincipal PrincipalMember principal, 
        @RequestParam("tagId") Long tagId) {

        service.deleteOneTagService(principal, tagId);

        return ResponseEntity.noContent().build();
            
    }
    
    @GetMapping("/my-tags")
    public ResponseEntity<List<TagResponseDto>> searchAllTags(@AuthenticationPrincipal PrincipalMember principal) {
        List<TagResponseDto> response = service.searchAllTagsService(principal);
        return ResponseEntity.ok(response);
    }
    
}