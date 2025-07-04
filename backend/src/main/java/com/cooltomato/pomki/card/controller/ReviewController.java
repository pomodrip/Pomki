package com.cooltomato.pomki.card.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.entity.CardStat;
import com.cooltomato.pomki.card.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Review", description = "카드 복습 관련 API")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/today")
    @Operation(summary = "오늘 복습할 카드 목록 조회")
    public ResponseEntity<List<CardStat>> getTodayReviewCards(
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardStat> cards = reviewService.getTodayReviewCards(principal);
        return ResponseEntity.ok(cards);
    }

    @PostMapping("/complete/{cardId}")
    @Operation(summary = "카드 복습 완료 처리")
    public ResponseEntity<Void> completeCardReview(
            @Parameter(description = "카드 ID") @PathVariable Long cardId,
            @Parameter(description = "난이도 (easy, good, hard, again)") 
            @RequestParam String difficulty,
            @AuthenticationPrincipal PrincipalMember principal) {
        reviewService.completeCardReview(cardId, difficulty, principal);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "복습 통계 조회")
    public ResponseEntity<ReviewService.ReviewStats> getReviewStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        ReviewService.ReviewStats stats = reviewService.getReviewStats(principal);
        return ResponseEntity.ok(stats);
    }
} 