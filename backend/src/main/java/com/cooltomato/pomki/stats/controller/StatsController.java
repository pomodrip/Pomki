package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.dto.DashboardStatsResponseDto;
import com.cooltomato.pomki.stats.service.StudyLogService;
import com.cooltomato.pomki.stats.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

    private final StudyLogService studyLogService;
    private final StatsService statsService;

    @GetMapping("/dashboard")
    @Operation(summary = "월별 캘린더용 대시보드 조회",
               description = "⚠️ 특수 목적용 - 일반적인 경우 /api/simple-stats/dashboard 사용 권장")
    public ResponseEntity<DashboardStatsResponseDto> getDashboardStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal PrincipalMember member) {
        
        // ⚠️ 응답 형식 불일치: 다른 API들과 달리 success/data 구조 없음
        // TODO: 응답 형식 통일 필요 { "success": true, "data": {...} }
        LocalDate today = LocalDate.now();
        int queryYear = (year!= null)? year : today.getYear();
        int queryMonth = (month!= null)? month : today.getMonthValue();

        DashboardStatsResponseDto stats = studyLogService.getDashboardStats(member.getMemberId(), queryYear, queryMonth);
        return ResponseEntity.ok(stats);
    }

    /**
     * 출석 기록 API
     */
    @PostMapping("/attendance")
    public ResponseEntity<?> recordAttendance(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            boolean isNewAttendance = statsService.recordAttendance(principalMember.getMemberId());
            
            if (isNewAttendance) {
                log.info("New attendance recorded for member: {}", principalMember.getMemberId());
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "출석이 기록되었습니다.",
                    "isNewAttendance", true
                ));
            } else {
                log.info("Member {} already attended today", principalMember.getMemberId());
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "오늘은 이미 출석하셨습니다.",
                    "isNewAttendance", false
                ));
            }
        } catch (Exception e) {
            log.error("Failed to record attendance for member: {}", principalMember.getMemberId(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "출석 기록 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 학습 시간 누적 API
     */
    @PostMapping("/study-time")
    public ResponseEntity<?> addStudyTime(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @RequestBody StudyTimeRequest request) {
        try {
            statsService.addStudyTime(principalMember.getMemberId(), request.getStudyMinutes());
            
            int totalMinutes = statsService.getTotalStudyMinutes(principalMember.getMemberId());
            
            log.info("Added {} minutes for member: {} (Total: {})", 
                    request.getStudyMinutes(), principalMember.getMemberId(), totalMinutes);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "학습 시간이 기록되었습니다.",
                "addedMinutes", request.getStudyMinutes(),
                "totalMinutes", totalMinutes
            ));
        } catch (Exception e) {
            log.error("Failed to add study time for member: {}", principalMember.getMemberId(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "학습 시간 기록 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 출석 여부 확인 API
     */
    @GetMapping("/attendance/today")
    public ResponseEntity<?> checkTodayAttendance(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            boolean isAttended = statsService.isAttendedToday(principalMember.getMemberId());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "isAttendedToday", isAttended,
                "date", LocalDate.now().toString()
            ));
        } catch (Exception e) {
            log.error("Failed to check attendance for member: {}", principalMember.getMemberId(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "출석 확인 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 총 학습 시간 조회 API
     */
    @GetMapping("/study-time/total")
    public ResponseEntity<?> getTotalStudyTime(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            int totalMinutes = statsService.getTotalStudyMinutes(principalMember.getMemberId());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "totalStudyMinutes", totalMinutes,
                "totalStudyHours", totalMinutes / 60.0
            ));
        } catch (Exception e) {
            log.error("Failed to get total study time for member: {}", principalMember.getMemberId(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "학습 시간 조회 중 오류가 발생했습니다."
            ));
        }
    }

    /**
     * 종합 통계 조회 API
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getMemberStatsSummary(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            StatsService.MemberStatsSummary summary = statsService.getMemberStatsSummary(principalMember.getMemberId());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "data", Map.of(
                    "totalStudyMinutes", summary.getTotalStudyMinutes(),
                    "totalStudyHours", summary.getTotalStudyHours(),
                    "totalStudyDays", summary.getTotalStudyDays(),
                    "currentStreak", summary.getCurrentStreak(),
                    "maxStreak", summary.getMaxStreak(),
                    "totalCardsStudied", summary.getTotalCardsStudied(),
                    "totalNotesCreated", summary.getTotalNotesCreated(),
                    "averageStudyMinutesPerDay", summary.getAverageStudyMinutesPerDay(),
                    "studyLevel", summary.getStudyLevel(),
                    "isActiveStudier", summary.getIsActiveStudier()
                )
            ));
        } catch (Exception e) {
            log.error("Failed to get member stats summary for member: {}", principalMember.getMemberId(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "통계 조회 중 오류가 발생했습니다."
            ));
        }
    }

    // Request DTO
    public static class StudyTimeRequest {
        private Integer studyMinutes;

        public Integer getStudyMinutes() { return studyMinutes; }
        public void setStudyMinutes(Integer studyMinutes) { this.studyMinutes = studyMinutes; }
    }
}