package com.cooltomato.pomki.stats.service;

// 임시로 주석 처리 - SimpleDashboardStatsService 사용
// import com.cooltomato.pomki.stats.dto.DashboardStatsDto;
import com.cooltomato.pomki.stats.entity.StudyLog;
import com.cooltomato.pomki.stats.repository.StudyLogRepository;
import com.cooltomato.pomki.stats.entity.Attendance;
import com.cooltomato.pomki.stats.entity.MemberStat;
import com.cooltomato.pomki.stats.repository.AttendanceRepository;
import com.cooltomato.pomki.stats.repository.MemberStatRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// 임시로 전체 주석 처리 - SimpleDashboardStatsService 사용
/*
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatsService {

    private final StudyLogRepository studySessionRepository;

    public DashboardStatsDto getDashboardStats(Long memberId) {
        log.info("Getting dashboard stats for member: {}", memberId);

        return DashboardStatsDto.builder()
                .todayStudy(getTodayStudyStats(memberId))
                .weeklyStats(getWeeklyStats(memberId))
                .recentActivities(getRecentActivities(memberId))
                .todayActivities(getTodayActivities(memberId))
                .trashInfo(getTrashInfo())
                .reviewSchedule(getReviewSchedule())
                .calendarData(getCalendarData())
                .build();
    }

    private DashboardStatsDto.TodayStudyDto getTodayStudyStats(Long memberId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        Integer studyMinutes = studySessionRepository.getTodayStudyMinutes(memberId, startOfDay, endOfDay);
        Integer pomodoroCompleted = studySessionRepository.getTodayPomodoroCompleted(memberId, startOfDay, endOfDay);
        Long totalActivities = studySessionRepository.getTotalActivitiesCount(memberId);

        Integer goalMinutes = 240; // 기본 4시간
        Integer progressPercentage = goalMinutes > 0 ? Math.min((studyMinutes * 100) / goalMinutes, 100) : 0;

        return DashboardStatsDto.TodayStudyDto.builder()
                .studyMinutes(studyMinutes != null ? studyMinutes : 0)
                .goalMinutes(goalMinutes)
                .progressPercentage(progressPercentage)
                .pomodoroCompleted(pomodoroCompleted != null ? pomodoroCompleted : 0)
                .pomodoroTotal(8)
                .totalStudyNotes(0L) // TODO: 실제 노트 수 조회
                .totalFlashcards(0L) // TODO: 실제 카드 수 조회
                .totalActiveDays(totalActivities != null ? totalActivities : 0L)
                .build();
    }

    private DashboardStatsDto.WeeklyStatsDto getWeeklyStats(Long memberId) {
        // 이번 주 시작과 끝 계산 (월요일 시작)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);

        // 주간 기본 통계
        Integer weeklyStudyMinutes = studySessionRepository.getWeeklyStudyMinutes(memberId, startOfWeek, endOfWeek);
        Long studyDaysThisWeek = studySessionRepository.getWeeklyStudyDays(memberId, startOfWeek, endOfWeek);
        Integer pomodoroCompleted = studySessionRepository.getWeeklyPomodoroCompleted(memberId, startOfWeek, endOfWeek);
        Integer pomodoroTotal = studySessionRepository.getWeeklyPomodoroTotal(memberId, startOfWeek, endOfWeek);

        // 연속 학습 일수 계산
        Integer studyStreak = calculateStudyStreak(memberId);

        // 일평균 학습 시간
        Integer avgDailyMinutes = studyDaysThisWeek > 0 ? weeklyStudyMinutes / studyDaysThisWeek.intValue() : 0;

        // 포모도로 완성률
        Integer pomodoroCompletionRate = pomodoroTotal > 0 ? (pomodoroCompleted * 100) / pomodoroTotal : 0;

        // 가장 활발한 학습 유형
        String mostActiveType = getMostActiveStudyType(memberId, startOfWeek, endOfWeek);

        // 주간 목표 달성률 (주 7일 * 4시간 = 1680분 기준)
        Integer weeklyGoal = 1680; // 28시간
        Integer weeklyGoalProgress = Math.min((weeklyStudyMinutes * 100) / weeklyGoal, 100);

        return DashboardStatsDto.WeeklyStatsDto.builder()
                .studyStreak(studyStreak)
                .studyDaysThisWeek(studyDaysThisWeek)
                .totalStudyMinutes(weeklyStudyMinutes)
                .avgDailyMinutes(avgDailyMinutes)
                .pomodoroCompletionRate(pomodoroCompletionRate)
                .mostActiveType(mostActiveType)
                .weeklyGoalProgress(weeklyGoalProgress)
                .build();
    }

    private Integer calculateStudyStreak(Long memberId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Date> studyDates = studySessionRepository.getStudyDatesLast30Days(memberId, thirtyDaysAgo);
        
        if (studyDates.isEmpty()) {
            return 0;
        }

        // 오늘부터 역순으로 연속 일수 계산
        LocalDate today = LocalDate.now();
        LocalDate currentDate = today;
        int streak = 0;

        for (Date sqlDate : studyDates) {
            LocalDate studyDate = sqlDate.toLocalDate();
            
            if (studyDate.equals(currentDate)) {
                streak++;
                currentDate = currentDate.minusDays(1);
            } else if (studyDate.isBefore(currentDate)) {
                // 연속성이 깨짐
                break;
            }
        }

        return streak;
    }

    private String getMostActiveStudyType(Long memberId, LocalDateTime startOfWeek, LocalDateTime endOfWeek) {
        List<Object[]> activityStats = studySessionRepository.getWeeklyActivityTypeStats(memberId, startOfWeek, endOfWeek);
        
        if (activityStats.isEmpty()) {
            return "학습 활동 없음";
        }

        StudyLog.ActivityType mostActiveType = (StudyLog.ActivityType) activityStats.get(0)[0];
        return mostActiveType.getDescription();
    }

    private List<DashboardStatsDto.RecentActivityDto> getRecentActivities(Long memberId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<StudyLog> recentSessions = studySessionRepository.getRecentActivities(memberId, sevenDaysAgo);

        return recentSessions.stream()
                .limit(10)
                .map(session -> DashboardStatsDto.RecentActivityDto.builder()
                        .activityType(session.getActivityType().getDescription())
                        .title(session.getActivityTitle() != null ? session.getActivityTitle() : "학습 활동")
                        .timeAgo(getTimeAgo(session.getCreatedAt()))
                        .relatedId(session.getSessionId())
                        .build())
                .collect(Collectors.toList());
    }

    private List<DashboardStatsDto.TodayActivityDto> getTodayActivities(Long memberId) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        
        List<StudyLog> todaySessions = studySessionRepository.getTodayActivities(memberId, startOfDay, endOfDay);

        return todaySessions.stream()
                .map(session -> DashboardStatsDto.TodayActivityDto.builder()
                        .activityType(session.getActivityType().getDescription())
                        .title(session.getActivityTitle() != null ? session.getActivityTitle() : "학습 활동")
                        .time(session.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")))
                        .duration(session.getStudyMinutes())
                        .build())
                .collect(Collectors.toList());
    }

    private DashboardStatsDto.TrashDto getTrashInfo() {
        // TODO: 실제 휴지통 데이터 구현
        return DashboardStatsDto.TrashDto.builder()
                .deletedNotesCount(0)
                .deletedCardsCount(0)
                .deletedDecksCount(0)
                .build();
    }

    private DashboardStatsDto.ReviewScheduleDto getReviewSchedule() {
        // TODO: ReviewService와 연동하여 실제 복습 스케줄 구현
        return DashboardStatsDto.ReviewScheduleDto.builder()
                .todayCards(0)
                .within3DaysCards(0)
                .within7DaysCards(0)
                .recommendedCardTitle("복습할 카드가 없습니다")
                .build();
    }

    private Map<String, Integer> getCalendarData() {
        // TODO: 실제 캘린더 데이터 구현
        return new HashMap<>();
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (minutes < 60) {
            return minutes + "분 전";
        } else if (hours < 24) {
            return hours + "시간 전";
        } else {
            return days + "일 전";
        }
    }

    @Transactional
    public void recordStudySession(Long memberId, StudyLog.ActivityType activityType,
                                 String activityTitle, Integer studyMinutes, Integer goalMinutes,
                                 Integer pomodoroCompleted, Integer pomodoroTotal) {
        StudyLog session = StudyLog.builder()
                .memberId(memberId)
                .activityType(activityType)
                .activityTitle(activityTitle)
                .studyMinutes(studyMinutes)
                .goalMinutes(goalMinutes)
                .pomodoroCompleted(pomodoroCompleted)
                .pomodoroTotal(pomodoroTotal)
                .build();
        
        studySessionRepository.save(session);
        log.info("Study session recorded for member: {} - {}", memberId, activityType);
    }
}
*/

// 새로운 활성 서비스 메서드들 - 출석 기록 및 학습 시간 누적
@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

    private final AttendanceRepository attendanceRepository;
    private final MemberStatRepository memberStatRepository;
    private final MemberRepository memberRepository;

    /**
     * 출석 기록 API
     * 오늘 이미 출석한 경우 중복 기록하지 않음
     */
    @Transactional
    public boolean recordAttendance(Long memberId) {
        try {
            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Member not found"));

            LocalDate today = LocalDate.now();
            
            // 오늘 이미 출석했는지 확인
            if (attendanceRepository.existsByMemberAndAttendanceDate(member, today)) {
                log.info("Member {} already attended today", memberId);
                return false; // 이미 출석함
            }

            // 새로운 출석 기록
            Attendance attendance = Attendance.builder()
                    .member(member)
                    .build();
            
            attendanceRepository.save(attendance);
            log.info("Attendance recorded for member: {} on {}", memberId, today);
            return true; // 출석 기록 성공
            
        } catch (Exception e) {
            log.error("Failed to record attendance for member: {}", memberId, e);
            throw new RuntimeException("출석 기록 중 오류가 발생했습니다.");
        }
    }

    /**
     * 학습 시간 누적 API
     * 타이머 세션 종료 시 호출
     */
    @Transactional
    public void addStudyTime(Long memberId, Integer studyMinutes) {
        try {
            if (studyMinutes == null || studyMinutes <= 0) {
                log.warn("Invalid study minutes: {} for member: {}", studyMinutes, memberId);
                return;
            }

            Member member = memberRepository.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Member not found"));

            // MemberStat 조회 또는 생성
            MemberStat memberStat = memberStatRepository.findById(memberId)
                    .orElseGet(() -> {
                        MemberStat newStat = MemberStat.builder()
                                .member(member)
                                .build();
                        return memberStatRepository.save(newStat);
                    });

            // 학습 시간 누적
            memberStat.addStudyMinutes(studyMinutes);
            memberStatRepository.save(memberStat);
            
            log.info("Added {} minutes to member: {} (Total: {})", 
                    studyMinutes, memberId, memberStat.getTotalStudyMinutes());
                    
        } catch (Exception e) {
            log.error("Failed to add study time for member: {}", memberId, e);
            throw new RuntimeException("학습 시간 기록 중 오류가 발생했습니다.");
        }
    }

    /**
     * 사용자 총 학습 시간 조회
     */
    @Transactional(readOnly = true)
    public Integer getTotalStudyMinutes(Long memberId) {
        return memberStatRepository.findById(memberId)
                .map(MemberStat::getTotalStudyMinutes)
                .orElse(0);
    }

    /**
     * 오늘 출석 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean isAttendedToday(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        return attendanceRepository.existsByMemberAndAttendanceDate(member, LocalDate.now());
    }
} 