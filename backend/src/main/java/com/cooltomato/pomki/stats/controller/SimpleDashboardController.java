package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.dto.SimpleDashboardStatsDto;
import com.cooltomato.pomki.stats.service.SimpleDashboardStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simple-stats")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Simple Dashboard Stats", description = "간단한 대시보드 통계 API")
public class SimpleDashboardController {

    private final SimpleDashboardStatsService simpleDashboardStatsService;

    @GetMapping("/dashboard") 
    @Operation(summary = "간단한 대시보드 통계 조회", 
               description = "7일 일정에 맞춘 핵심 통계만 제공")
    public ResponseEntity<SimpleDashboardStatsDto> getSimpleDashboardStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.info("Simple dashboard stats requested by member: {}", 
                principal.getMemberInfo().getMemberId());
        
        SimpleDashboardStatsDto stats = simpleDashboardStatsService.getDashboardStats(principal);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/today")
    @Operation(summary = "오늘의 학습 통계만 조회")
    public ResponseEntity<SimpleDashboardStatsDto.TodayStudyStats> getTodayStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        SimpleDashboardStatsDto stats = simpleDashboardStatsService.getDashboardStats(principal);
        return ResponseEntity.ok(stats.getTodayStudy());
    }

    @GetMapping("/weekly")
    @Operation(summary = "주간 학습 통계만 조회")
    public ResponseEntity<SimpleDashboardStatsDto.WeeklyStats> getWeeklyStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        SimpleDashboardStatsDto stats = simpleDashboardStatsService.getDashboardStats(principal);
        return ResponseEntity.ok(stats.getWeeklyStats());
    }

    @GetMapping("/review")
    @Operation(summary = "복습 통계만 조회")
    public ResponseEntity<SimpleDashboardStatsDto.ReviewStats> getReviewStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        SimpleDashboardStatsDto stats = simpleDashboardStatsService.getDashboardStats(principal);
        return ResponseEntity.ok(stats.getReviewStats());
    }

    @GetMapping("/total")
    @Operation(summary = "누적 통계만 조회")
    public ResponseEntity<SimpleDashboardStatsDto.TotalStats> getTotalStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        SimpleDashboardStatsDto stats = simpleDashboardStatsService.getDashboardStats(principal);
        return ResponseEntity.ok(stats.getTotalStats());
    }
} 