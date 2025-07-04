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

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@Slf4j
public class StatsController {

    private final StudyLogService studyLogService;
    private final StatsService statsService;

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

    /**
     * 출석 기록 API
     */
    @PostMapping("/attendance")
    public ResponseEntity<?> recordAttendance(@AuthenticationPrincipal PrincipalMember member) {
        try {
            boolean isNewAttendance = statsService.recordAttendance(member.getMemberId());
            
            if (isNewAttendance) {
                log.info("New attendance recorded for member: {}", member.getMemberId());
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "출석이 기록되었습니다.",
                    "isNewAttendance", true
                ));
            } else {
                log.info("Member {} already attended today", member.getMemberId());
                return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "오늘은 이미 출석하셨습니다.",
                    "isNewAttendance", false
                ));
            }
        } catch (Exception e) {
            log.error("Failed to record attendance for member: {}", member.getMemberId(), e);
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
            @AuthenticationPrincipal PrincipalMember member,
            @RequestBody StudyTimeRequest request) {
        try {
            statsService.addStudyTime(member.getMemberId(), request.getStudyMinutes());
            
            Integer totalMinutes = statsService.getTotalStudyMinutes(member.getMemberId());
            
            log.info("Added {} minutes for member: {} (Total: {})", 
                    request.getStudyMinutes(), member.getMemberId(), totalMinutes);
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "학습 시간이 기록되었습니다.",
                "addedMinutes", request.getStudyMinutes(),
                "totalMinutes", totalMinutes
            ));
        } catch (Exception e) {
            log.error("Failed to add study time for member: {}", member.getMemberId(), e);
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
    public ResponseEntity<?> checkTodayAttendance(@AuthenticationPrincipal PrincipalMember member) {
        try {
            boolean isAttended = statsService.isAttendedToday(member.getMemberId());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "isAttendedToday", isAttended,
                "date", LocalDate.now().toString()
            ));
        } catch (Exception e) {
            log.error("Failed to check attendance for member: {}", member.getMemberId(), e);
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
    public ResponseEntity<?> getTotalStudyTime(@AuthenticationPrincipal PrincipalMember member) {
        try {
            Integer totalMinutes = statsService.getTotalStudyMinutes(member.getMemberId());
            
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "totalStudyMinutes", totalMinutes,
                "totalStudyHours", totalMinutes / 60.0
            ));
        } catch (Exception e) {
            log.error("Failed to get total study time for member: {}", member.getMemberId(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "학습 시간 조회 중 오류가 발생했습니다."
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