package com.cooltomato.pomki.stats.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.stats.dto.DashboardStatsResponseDto;
import com.cooltomato.pomki.stats.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@Tag(name = "Statistics", description = "학습 통계 및 대시보드 API")
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StudyLogService studyLogService;

    @Operation(summary = "대시보드 통계 조회", description = "월별 학습 통계 및 대시보드 정보를 조회합니다.")
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponseDto> getDashboardStats(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal PrincipalMember member) {
        
        LocalDate today = LocalDate.now();
        int queryYear = (year!= null)? year : today.getYear();
        int queryMonth = (month!= null)? month : today.getMonthValue();

        DashboardStatsResponseDto stats = studyLogService.getDashboardStats(member.getMemberId(), queryYear, queryMonth);
        return ResponseEntity.ok(stats);
    }
}

// package com.cooltomato.pomki.stats.controller;

// import com.cooltomato.pomki.auth.dto.PrincipalMember;
// import com.cooltomato.pomki.stats.dto.DashboardStatsDto;
// import com.cooltomato.pomki.stats.entity.StudyLog;
// import com.cooltomato.pomki.stats.service.StatsService;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/stats")
// @RequiredArgsConstructor
// @Slf4j
// public class StatsController {

//     private final StatsService statsService;

//     @GetMapping("/dashboard")
//     public ResponseEntity<DashboardStatsDto> getDashboardStats(
//             @AuthenticationPrincipal PrincipalMember principalMember) {
        
//         log.info("Dashboard stats requested by member: {}", principalMember.getMemberId());
        
//         DashboardStatsDto dashboardStats = statsService.getDashboardStats(principalMember.getMemberId());
//         return ResponseEntity.ok(dashboardStats);
//     }

//     @PostMapping("/session")
//     public ResponseEntity<?> recordStudySession(
//             @AuthenticationPrincipal PrincipalMember principalMember,
//             @RequestBody StudySessionRequest request) {
        
//         log.info("Study session recording requested by member: {}", principalMember.getMemberId());
        
//         statsService.recordStudySession(
//                 principalMember.getMemberId(),
//                 request.getActivityType(),
//                 request.getActivityTitle(),
//                 request.getStudyMinutes(),
//                 request.getGoalMinutes(),
//                 request.getPomodoroCompleted(),
//                 request.getPomodoroTotal()
//         );
        
//         return ResponseEntity.ok().build();
//     }

//     @GetMapping("/today-activities")
//     public ResponseEntity<?> getTodayActivities(
//             @AuthenticationPrincipal PrincipalMember principalMember) {
        
//         log.info("Today activities requested by member: {}", principalMember.getMemberId());
        
//         DashboardStatsDto dashboardStats = statsService.getDashboardStats(principalMember.getMemberId());
//         return ResponseEntity.ok(dashboardStats.getTodayActivities());
//     }

//     @GetMapping("/recent-activities")
//     public ResponseEntity<?> getRecentActivities(
//             @AuthenticationPrincipal PrincipalMember principalMember) {
        
//         log.info("Recent activities requested by member: {}", principalMember.getMemberId());
        
//         DashboardStatsDto dashboardStats = statsService.getDashboardStats(principalMember.getMemberId());
//         return ResponseEntity.ok(dashboardStats.getRecentActivities());
//     }

//     @GetMapping("/weekly-stats")
//     public ResponseEntity<?> getWeeklyStats(
//             @AuthenticationPrincipal PrincipalMember principalMember) {
        
//         log.info("Weekly stats requested by member: {}", principalMember.getMemberId());
        
//         DashboardStatsDto dashboardStats = statsService.getDashboardStats(principalMember.getMemberId());
//         return ResponseEntity.ok(dashboardStats.getWeeklyStats());
//     }

//     // Request DTO
//     public static class StudySessionRequest {
//         private StudyLog.ActivityType activityType;
//         private String activityTitle;
//         private Integer studyMinutes;
//         private Integer goalMinutes;
//         private Integer pomodoroCompleted;
//         private Integer pomodoroTotal;

//         // Getters
//         public StudyLog.ActivityType getActivityType() { return activityType; }
//         public String getActivityTitle() { return activityTitle; }
//         public Integer getStudyMinutes() { return studyMinutes; }
//         public Integer getGoalMinutes() { return goalMinutes; }
//         public Integer getPomodoroCompleted() { return pomodoroCompleted; }
//         public Integer getPomodoroTotal() { return pomodoroTotal; }

//         // Setters
//         public void setActivityType(StudyLog.ActivityType activityType) { this.activityType = activityType; }
//         public void setActivityTitle(String activityTitle) { this.activityTitle = activityTitle; }
//         public void setStudyMinutes(Integer studyMinutes) { this.studyMinutes = studyMinutes; }
//         public void setGoalMinutes(Integer goalMinutes) { this.goalMinutes = goalMinutes; }
//         public void setPomodoroCompleted(Integer pomodoroCompleted) { this.pomodoroCompleted = pomodoroCompleted; }
//         public void setPomodoroTotal(Integer pomodoroTotal) { this.pomodoroTotal = pomodoroTotal; }
//     }
// } 