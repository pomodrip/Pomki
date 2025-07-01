package com.cooltomato.pomki.card.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.entity.CardStat;
import com.cooltomato.pomki.card.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/batch-complete")
    @Operation(summary = "학습 세션의 카드 복습 결과 일괄 처리")
    public ResponseEntity<Void> completeStudySession(
            @RequestBody List<com.cooltomato.pomki.card.dto.CardReviewRequestDto> reviewRequests,
            @AuthenticationPrincipal PrincipalMember principal) {
        reviewService.completeStudySession(reviewRequests, principal);
        return ResponseEntity.ok().build();
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

    @PostMapping("/complete-simple/{cardId}")
    @Operation(summary = "카드 복습 완료 처리 (단순화된 버전)")
    public ResponseEntity<Void> completeCardReviewSimple(
            @Parameter(description = "카드 ID") @PathVariable Long cardId,
            @Parameter(description = "난이도 (hard: 1일, confuse: 3일, easy: 5일)") 
            @RequestParam String difficulty,
            @AuthenticationPrincipal PrincipalMember principal) {
        reviewService.completeCardReviewSimple(cardId, difficulty, principal);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "복습 통계 조회")
    public ResponseEntity<ReviewService.ReviewStats> getReviewStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        ReviewService.ReviewStats stats = reviewService.getReviewStats(principal);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/optimized")
    @Operation(summary = "최적화된 복습 카드 조회 (일일 제한 + 우선순위)")
    public ResponseEntity<List<CardStat>> getOptimizedReviewCards(
            @RequestParam(required = false) Integer maxCards,
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardStat> cards = reviewService.getOptimizedReviewCards(principal, maxCards);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/analysis")
    @Operation(summary = "개인화된 학습 성과 분석")
    public ResponseEntity<ReviewService.LearningAnalysis> getLearningAnalysis(
            @AuthenticationPrincipal PrincipalMember principal) {
        ReviewService.LearningAnalysis analysis = reviewService.getLearningAnalysis(principal);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/struggling")
    @Operation(summary = "취약한 카드 집중 복습 추천")
    public ResponseEntity<List<CardStat>> getStrugglingCards(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardStat> cards = reviewService.getStrugglingCardsForReview(principal, limit);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/load-recommendation")
    @Operation(summary = "학습 부하 조절 추천")
    public ResponseEntity<ReviewService.StudyLoadRecommendation> getStudyLoadRecommendation(
            @AuthenticationPrincipal PrincipalMember principal) {
        ReviewService.StudyLoadRecommendation recommendation = 
                reviewService.getStudyLoadRecommendation(principal);
        return ResponseEntity.ok(recommendation);
    }

    @PostMapping("/batch-complete-beacon")
    @Operation(summary = "페이지 이탈 시 Beacon을 통한 일괄 처리")
    public ResponseEntity<Void> completeStudySessionWithBeacon(
            @RequestBody List<com.cooltomato.pomki.card.dto.CardReviewRequestDto> reviewRequests,
            @AuthenticationPrincipal PrincipalMember principal) {
        if (principal != null) {
            reviewService.completeStudySession(reviewRequests, principal);
        }
        return ResponseEntity.ok().build();
    }
} 