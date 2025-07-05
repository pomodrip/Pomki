package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.dto.SimpleDashboardStatsDto;
import com.cooltomato.pomki.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Statistics", description = "학습 통계 및 대시보드 API")
@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stats & Dashboard API", description = "사용자 활동 통계, 출석, 대시보드 관련 API")
public class StatsController {

    private final StatsService statsService;


    @GetMapping("/dashboard")
    @Operation(summary = "메인 대시보드 전체 데이터 조회",
               description = "메인 대시보드에 필요한 모든 통계(학습, 복습, 출석 등)를 한번에 조회합니다.")
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200", 
            description = "대시보드 통계 조회 성공",
            content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = SimpleDashboardStatsDto.class))
        ),
        @ApiResponse(
            responseCode = "401", 
            description = "인증 실패"
        )
    })
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal PrincipalMember principal) {
        SimpleDashboardStatsDto data = statsService.getDashboardStats(principal);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @PostMapping("/attendance")
    @Operation(summary = "출석 기록", description = "오늘 날짜로 출석을 기록합니다. 하루에 한 번만 기록됩니다.")
    public ResponseEntity<Map<String, Object>> recordAttendance(@AuthenticationPrincipal PrincipalMember principalMember) {
        boolean isNewAttendance = statsService.recordAttendance(principalMember.getMemberId());
        String message = isNewAttendance ? "출석이 기록되었습니다." : "오늘은 이미 출석하셨습니다.";
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", message,
            "isNewAttendance", isNewAttendance
        ));
    }

    @PostMapping("/study-time")
    @Operation(summary = "학습 시간 누적 기록", description = "타이머 등 특정 활동으로 누적된 학습 시간을 분 단위로 기록합니다.")
    public ResponseEntity<Map<String, Object>> addStudyTime(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @RequestBody StudyTimeRequest request) {
        
        statsService.addStudyTime(principalMember.getMemberId(), request.getStudyMinutes());
        int totalMinutes = statsService.getTotalStudyMinutes(principalMember.getMemberId());
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "학습 시간이 기록되었습니다.",
            "addedMinutes", request.getStudyMinutes(),
            "totalMinutes", totalMinutes
        ));
    }

    // Request DTO
    public static class StudyTimeRequest {
        private Integer studyMinutes;
        public Integer getStudyMinutes() { return studyMinutes; }
        public void setStudyMinutes(Integer studyMinutes) { this.studyMinutes = studyMinutes; }
    }
}