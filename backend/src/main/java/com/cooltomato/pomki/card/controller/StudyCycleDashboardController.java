package com.cooltomato.pomki.card.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.StudyCycleDashboardDto;
import com.cooltomato.pomki.card.service.StudyCycleDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 학습 주기 대시보드 컨트롤러
 * hard: 1일, confuse: 3일, easy: 5일 시스템
 */
@RestController
@RequestMapping("/api/study-cycle")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Study Cycle Dashboard", description = "학습 주기 대시보드 API")
public class StudyCycleDashboardController {

    private final StudyCycleDashboardService studyCycleDashboardService;

    @GetMapping("/dashboard")
    @Operation(summary = "학습 주기 대시보드 조회", 
               description = "날짜별로 분류된 복습 카드 현황과 통계를 제공합니다")
    public ResponseEntity<StudyCycleDashboardDto> getStudyCycleDashboard(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        log.info("학습 주기 대시보드 조회 요청: memberId={}", 
                principal.getMemberInfo().getMemberId());
        
        StudyCycleDashboardDto dashboard = studyCycleDashboardService.getDashboardData(principal);
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/today-cards")
    @Operation(summary = "오늘 학습할 카드 목록만 조회")
    public ResponseEntity<StudyCycleDashboardDto.StudyCardInfo[]> getTodayCards(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        StudyCycleDashboardDto dashboard = studyCycleDashboardService.getDashboardData(principal);
        return ResponseEntity.ok(dashboard.getTodayCards().toArray(new StudyCycleDashboardDto.StudyCardInfo[0]));
    }

    @GetMapping("/overdue-cards")
    @Operation(summary = "지연된 카드 목록만 조회")
    public ResponseEntity<StudyCycleDashboardDto.StudyCardInfo[]> getOverdueCards(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        StudyCycleDashboardDto dashboard = studyCycleDashboardService.getDashboardData(principal);
        return ResponseEntity.ok(dashboard.getOverdueCards().toArray(new StudyCycleDashboardDto.StudyCardInfo[0]));
    }

    @GetMapping("/stats")
    @Operation(summary = "학습 주기 통계만 조회")
    public ResponseEntity<StudyCycleDashboardDto.StudyStats> getStudyCycleStats(
            @AuthenticationPrincipal PrincipalMember principal) {
        
        StudyCycleDashboardDto dashboard = studyCycleDashboardService.getDashboardData(principal);
        return ResponseEntity.ok(dashboard.getStats());
    }
} 