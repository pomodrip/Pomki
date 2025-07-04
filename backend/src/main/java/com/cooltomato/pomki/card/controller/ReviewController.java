package com.cooltomato.pomki.card.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.dto.CardReviewRequestDto;
import com.cooltomato.pomki.card.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/review")
@RequiredArgsConstructor
@Tag(name = "Review API", description = "카드 복습 및 스케줄링 관련 API")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/session-cards")
    @Operation(summary = "학습 세션용 카드 목록 조회",
               description = "새로운 학습 세션을 시작할 때 호출합니다. 복습 기한이 오늘이거나 이미 지난 모든 카드를 한 번에 조회합니다.")
    public ResponseEntity<List<CardResponseDto>> getCardsForSession(
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardResponseDto> cards = reviewService.getTodayReviewCards(principal);
        return ResponseEntity.ok(cards);
    }

    @PostMapping("/batch-complete")
    @Operation(summary = "카드 복습 결과 일괄 처리",
               description = "학습 세션 종료 시, 카드별 평가(hard, confuse, easy) 결과를 이 API로 일괄 전송합니다.")
    public ResponseEntity<Void> batchCompleteReview(
            @RequestBody List<CardReviewRequestDto> reviewRequests,
            @AuthenticationPrincipal PrincipalMember principal) {
        reviewService.batchCompleteReview(reviewRequests, principal);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/today")
    @Operation(summary = "오늘 학습할 카드 목록 상세 조회",
               description = "복습 주기가 정확히 오늘인 카드들의 목록을 조회합니다.")
    public ResponseEntity<List<CardResponseDto>> getTodaysCards(
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardResponseDto> cards = reviewService.getCardsForToday(principal);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/overdue")
    @Operation(summary = "밀린 카드 목록 상세 조회",
               description = "복습 주기가 이미 지난 카드들의 목록을 조회합니다.")
    public ResponseEntity<List<CardResponseDto>> getOverdueCards(
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardResponseDto> cards = reviewService.getOverdueCards(principal);
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "3일 내 학습할 카드 목록 상세 조회",
               description = "복습 주기가 내일부터 3일 사이에 도래하는 카드들의 목록을 조회합니다.")
    public ResponseEntity<List<CardResponseDto>> getUpcomingCards(
            @AuthenticationPrincipal PrincipalMember principal) {
        List<CardResponseDto> cards = reviewService.getUpcomingCards(principal);
        return ResponseEntity.ok(cards);
    }
} 