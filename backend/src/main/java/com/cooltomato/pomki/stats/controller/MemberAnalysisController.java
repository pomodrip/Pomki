package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.service.StatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis/member")
@RequiredArgsConstructor
@Tag(name = "Member Analysis API", description = "사용자(멤버) 활동에 대한 종합 분석 및 편의 기능 API")
public class MemberAnalysisController {

    private final StatsService statsService;

    @GetMapping("/summary")
    @Operation(summary = "종합 프로필 통계 조회", description = "사용자의 학습 레벨, 총 학습일, 연속 출석일 등 종합 프로필 정보를 조회합니다.")
    public ResponseEntity<?> getMemberStatsSummary(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            StatsService.MemberStatsSummary summary = statsService.getMemberStatsSummary(principalMember.getMemberId());
            return ResponseEntity.ok().body(Map.of("success", true, "data", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "통계 조회 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/attendance/today")
    @Operation(summary = "오늘 출석 여부 확인", description = "오늘 출석했는지 여부를 간단히 확인하여 UI 편의성을 돕습니다.")
    public ResponseEntity<?> checkTodayAttendance(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            boolean isAttended = statsService.isAttendedToday(principalMember.getMemberId());
            return ResponseEntity.ok().body(Map.of("success", true, "isAttendedToday", isAttended, "date", LocalDate.now().toString()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "출석 확인 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/study-time/total")
    @Operation(summary = "총 누적 학습 시간 조회", description = "사용자의 전체 누적 학습 시간을 분과 시간 단위로 조회합니다.")
    public ResponseEntity<?> getTotalStudyTime(@AuthenticationPrincipal PrincipalMember principalMember) {
        try {
            int totalMinutes = statsService.getTotalStudyMinutes(principalMember.getMemberId());
            return ResponseEntity.ok().body(Map.of("success", true, "totalStudyMinutes", totalMinutes, "totalStudyHours", totalMinutes / 60.0));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "학습 시간 조회 중 오류가 발생했습니다."));
        }
    }
} 