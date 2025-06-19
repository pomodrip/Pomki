package com.cooltomato.pomki.stats.service;

import com.cooltomato.pomki.stats.dto.DashboardStatsDto;
import com.cooltomato.pomki.stats.entity.StudySession;
import com.cooltomato.pomki.stats.repository.StudySessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StatsService {

    private final StudySessionRepository studySessionRepository;

    public DashboardStatsDto getDashboardStats(Long memberId) {
        log.info("Getting dashboard stats for member: {}", memberId);

        return DashboardStatsDto.builder()
                .todayStudy(getTodayStudyStats(memberId))
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

    private List<DashboardStatsDto.RecentActivityDto> getRecentActivities(Long memberId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<StudySession> recentSessions = studySessionRepository.getRecentActivities(memberId, sevenDaysAgo);

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
        
        List<StudySession> todaySessions = studySessionRepository.getTodayActivities(memberId, startOfDay, endOfDay);

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
        // TODO: 실제 복습 스케줄 구현
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
    public void recordStudySession(Long memberId, StudySession.ActivityType activityType,
                                 String activityTitle, Integer studyMinutes, Integer goalMinutes,
                                 Integer pomodoroCompleted, Integer pomodoroTotal) {
        StudySession session = StudySession.builder()
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