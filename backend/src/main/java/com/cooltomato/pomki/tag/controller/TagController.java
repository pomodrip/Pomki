package com.cooltomato.pomki.tag.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.service.TagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// [Tag] TagController: 태그 관련 API를 제공하는 컨트롤러 
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tag", description = "태그 관련 API")
public class TagController {

    private final TagService service;

    @Operation(summary = "모든 태그 조회", description = "노트 및 카드 생성시 모든 태그를 추천받기 위한 API")
    @GetMapping("/all")
    public ResponseEntity<List<TagResponseDto>> readAllTags(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        List<TagResponseDto> response = service.readAllNoteTagService(principal) ;
        return ResponseEntity.ok(response) ;
    }
    
    
}
