package com.cooltomato.pomki.tag.controller;

import com.cooltomato.pomki.ai.dto.TagRecommendationRequestDto;
import com.cooltomato.pomki.ai.dto.TagRecommendationResponseDto;
import com.cooltomato.pomki.ai.service.TagRecommendationService;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// [Tag] TagController: 태그 관련 API를 제공하는 컨트롤러
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tag", description = "태그 관련 API")
public class TagController {

    private final TagService service;
    private final TagRecommendationService tagRecommendationService;

    @Operation(summary = "모든 태그 조회", description = "노트 및 카드 생성시 모든 태그를 추천받기 위한 API")
    @GetMapping("/all")
    public ResponseEntity<List<TagResponseDto>> readAllTags(
            @Parameter(hidden = true) @AuthenticationPrincipal PrincipalMember principal) {
        List<TagResponseDto> response = service.readAllNoteTagService(principal) ;
        return ResponseEntity.ok(response) ;
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
