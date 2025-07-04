package com.cooltomato.pomki.stats.service;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.stats.entity.Attendance;
import com.cooltomato.pomki.stats.entity.MemberStat;
import com.cooltomato.pomki.stats.repository.AttendanceRepository;
import com.cooltomato.pomki.stats.repository.MemberStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.cooltomato.pomki.stats.dto.SimpleDashboardStatsDto;
import com.cooltomato.pomki.stats.dto.TodayStatsDto;
import com.cooltomato.pomki.stats.repository.StudyLogRepository;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.card.repository.CardStatRepository;
import com.cooltomato.pomki.card.service.ReviewService;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.auth.dto.PrincipalMember;

import java.time.DayOfWeek;
import java.time.YearMonth;
import java.sql.Date;

// 출석 기록 및 학습 시간 누적 서비스
@Service
@RequiredArgsConstructor
@Slf4j
public class StatsService {

    private final MemberStatRepository memberStatRepository;
    private final AttendanceRepository attendanceRepository;
    private final MemberRepository memberRepository;
    private final StudyLogService studyLogService;
    private final StudyLogRepository studyLogRepository;
    private final NoteRepository noteRepository;
    private final DeckRepository deckRepository;
    private final CardRepository cardRepository;
    private final ReviewService reviewService;
    private final CardStatRepository cardStatRepository;

    /**
     * 출석 기록 - 중복 방지 + 연속 출석 관리
     */
    @Transactional
    public boolean recordAttendance(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        LocalDate today = LocalDate.now();
        
        // 이미 출석했는지 확인
        Optional<Attendance> existingAttendance = attendanceRepository.findByMemberAndAttendanceDate(member, today);
        if (existingAttendance.isPresent()) {
            log.info("이미 출석 기록이 있습니다: memberId={}, date={}", member.getMemberId(), today);
            return false; // 이미 출석함
        }
        
        // 출석 기록 저장
        Attendance attendance = Attendance.builder()
                .member(member)
                .build();
        attendanceRepository.save(attendance);
        
        // StudyLog에도 출석 기록
        studyLogService.logAttendance(member);
        
        // MemberStat 업데이트 - 학습 일수 및 연속 출석 관리
        updateAttendanceStats(member, today);
        
        log.info("출석 기록 완료: memberId={}, date={}", member.getMemberId(), today);
        return true; // 새로운 출석 기록
    }

    /**
     * 오늘 출석 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean isAttendedToday(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        LocalDate today = LocalDate.now();
        return attendanceRepository.findByMemberAndAttendanceDate(member, today).isPresent();
    }

    /**
     * 학습시간 누적 (기존 방식 유지 + 통계 연동)
     */
    @Transactional
    public void addStudyTime(Long memberId, int minutes) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        MemberStat memberStat = memberStatRepository.findByMember(member)
                .orElseGet(() -> {
                    MemberStat newStat = MemberStat.builder()
                            .member(member)
                            .build();
                    return memberStatRepository.save(newStat);
                });

        memberStat.addStudyMinutes(minutes);
        memberStatRepository.save(memberStat);
        
        // 학습 시간 증가분을 StudyLog에도 기록하여 대시보드 todayStudy 집계에 포함되도록 함
        studyLogService.logStudyActivity(
                member,
                com.cooltomato.pomki.stats.entity.StudyLog.ActivityType.STUDY_SESSION_COMPLETED.name(),
                "학습 시간 기록",
                minutes
        );
        
        log.info("학습시간 누적: memberId={}, 추가={}분, 총={}분", 
                member.getMemberId(), minutes, memberStat.getTotalStudyMinutes());
    }

    /**
     * 총 학습시간 조회
     */
    @Transactional(readOnly = true)
    public int getTotalStudyMinutes(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        return memberStatRepository.findByMember(member)
                .map(MemberStat::getTotalStudyMinutes)
                .orElse(0);
    }

    /**
     * 종합 통계 조회
     */
    @Transactional(readOnly = true)
    public MemberStatsSummary getMemberStatsSummary(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        
        MemberStat memberStat = memberStatRepository.findByMember(member)
                .orElse(null);
        
        if (memberStat == null) {
            return MemberStatsSummary.empty();
        }
        
        return MemberStatsSummary.builder()
                .totalStudyMinutes(memberStat.getTotalStudyMinutes())
                .totalStudyHours(memberStat.getTotalStudyHours())
                .totalStudyDays(memberStat.getTotalStudyDays())
                .currentStreak(memberStat.getCurrentStreak())
                .maxStreak(memberStat.getMaxStreak())
                .totalCardsStudied(memberStat.getTotalCardsStudied())
                .totalNotesCreated(memberStat.getTotalNotesCreated())
                .averageStudyMinutesPerDay(memberStat.getAverageStudyMinutesPerDay())
                .studyLevel(memberStat.getStudyLevel())
                .isActiveStudier(memberStat.isActiveStudier())
                .build();
    }

    /**
     * 출석 통계 업데이트 헬퍼 메서드
     */
    private void updateAttendanceStats(Member member, LocalDate today) {
        MemberStat memberStat = memberStatRepository.findByMember(member)
                .orElseGet(() -> {
                    MemberStat newStat = MemberStat.builder()
                            .member(member)
                            .build();
                    return memberStatRepository.save(newStat);
                });
        
        // 학습 일수 증가
        memberStat.incrementStudyDays();
        
        // 연속 출석 확인 및 업데이트
        LocalDate yesterday = today.minusDays(1);
        boolean wasAttendedYesterday = attendanceRepository.findByMemberAndAttendanceDate(member, yesterday).isPresent();
        memberStat.updateStreak(wasAttendedYesterday);
        
        memberStatRepository.save(memberStat);
        
        log.info("출석 통계 업데이트: memberId={}, 총학습일수={}, 연속출석={}", 
                member.getMemberId(), memberStat.getTotalStudyDays(), memberStat.getCurrentStreak());
    }

    /**
     * 통계 요약 DTO
     */
    public static class MemberStatsSummary {
        private final Integer totalStudyMinutes;
        private final Double totalStudyHours;
        private final Integer totalStudyDays;
        private final Integer currentStreak;
        private final Integer maxStreak;
        private final Integer totalCardsStudied;
        private final Integer totalNotesCreated;
        private final Double averageStudyMinutesPerDay;
        private final String studyLevel;
        private final Boolean isActiveStudier;

        @lombok.Builder
        public MemberStatsSummary(Integer totalStudyMinutes, Double totalStudyHours, 
                                Integer totalStudyDays, Integer currentStreak, Integer maxStreak,
                                Integer totalCardsStudied, Integer totalNotesCreated,
                                Double averageStudyMinutesPerDay, String studyLevel, Boolean isActiveStudier) {
            this.totalStudyMinutes = totalStudyMinutes != null ? totalStudyMinutes : 0;
            this.totalStudyHours = totalStudyHours != null ? totalStudyHours : 0.0;
            this.totalStudyDays = totalStudyDays != null ? totalStudyDays : 0;
            this.currentStreak = currentStreak != null ? currentStreak : 0;
            this.maxStreak = maxStreak != null ? maxStreak : 0;
            this.totalCardsStudied = totalCardsStudied != null ? totalCardsStudied : 0;
            this.totalNotesCreated = totalNotesCreated != null ? totalNotesCreated : 0;
            this.averageStudyMinutesPerDay = averageStudyMinutesPerDay != null ? averageStudyMinutesPerDay : 0.0;
            this.studyLevel = studyLevel != null ? studyLevel : "초보자";
            this.isActiveStudier = isActiveStudier != null ? isActiveStudier : false;
        }

        public static MemberStatsSummary empty() {
            return MemberStatsSummary.builder().build();
        }

        // Getters
        public Integer getTotalStudyMinutes() { return totalStudyMinutes; }
        public Double getTotalStudyHours() { return totalStudyHours; }
        public Integer getTotalStudyDays() { return totalStudyDays; }
        public Integer getCurrentStreak() { return currentStreak; }
        public Integer getMaxStreak() { return maxStreak; }
        public Integer getTotalCardsStudied() { return totalCardsStudied; }
        public Integer getTotalNotesCreated() { return totalNotesCreated; }
        public Double getAverageStudyMinutesPerDay() { return averageStudyMinutesPerDay; }
        public String getStudyLevel() { return studyLevel; }
        public Boolean getIsActiveStudier() { return isActiveStudier; }
    }

    // ====================================================================
    // == SimpleDashboardStatsService에서 마이그레이션된 기능 ==
    // ====================================================================

    public SimpleDashboardStatsDto getDashboardStats(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        log.info("Getting simple dashboard stats for member: {}", memberId);

        return SimpleDashboardStatsDto.builder()
                .todayStudy(getTodayStudyStats(memberId))
                .weeklyStats(getWeeklyStats(memberId))
                .reviewStats(getReviewStats(principal))
                .attendanceDates(getAttendanceDates(memberId))
                .totalStats(getTotalStats(memberId))
                .build();
    }

    public SimpleDashboardStatsDto.TodayStudyStats getTodayStatsOnly(PrincipalMember principal) {
        return getTodayStudyStats(principal.getMemberInfo().getMemberId());
    }

    public SimpleDashboardStatsDto.WeeklyStats getWeeklyStatsOnly(PrincipalMember principal) {
        return getWeeklyStats(principal.getMemberInfo().getMemberId());
    }

    public SimpleDashboardStatsDto.ReviewStats getReviewStatsOnly(PrincipalMember principal) {
        return getReviewStats(principal);
    }

    public SimpleDashboardStatsDto.TotalStats getTotalStatsOnly(PrincipalMember principal) {
        return getTotalStats(principal.getMemberInfo().getMemberId());
    }

    private SimpleDashboardStatsDto.TodayStudyStats getTodayStudyStats(Long memberId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        TodayStatsDto todayStats = studyLogRepository.getTodayStats(memberId, startOfDay);
        int goalMinutes = 240;
        int progressPercentage = goalMinutes > 0 ?
                Math.min((int)((todayStats.getTotalFocusMinutes() * 100) / goalMinutes), 100) : 0;
        int todayActivities = (int)(todayStats.getTotalFocusMinutes() / 25);

        return SimpleDashboardStatsDto.TodayStudyStats.builder()
                .totalFocusMinutes(todayStats.getTotalFocusMinutes())
                .pomodoroCompleted((int)todayStats.getPomodoroSessionsCompleted())
                .goalMinutes(goalMinutes)
                .progressPercentage(progressPercentage)
                .todayActivities(todayActivities)
                .build();
    }

    private SimpleDashboardStatsDto.WeeklyStats getWeeklyStats(Long memberId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);
        List<Date> weeklySqlDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId, startOfWeek, endOfWeek);
        List<LocalDate> weeklyDates = mapToLocalDate(weeklySqlDates);
        int studyDaysThisWeek = weeklyDates.size();
        int currentStreak = calculateSimpleStreak(memberId);
        Long totalWeeklyMinutes = studyLogRepository.getWeeklyStudyMinutes(memberId, startOfWeek, endOfWeek);
        double avgDailyMinutes = studyDaysThisWeek > 0 ?
                (double)totalWeeklyMinutes / studyDaysThisWeek : 0;

        return SimpleDashboardStatsDto.WeeklyStats.builder()
                .studyDaysThisWeek(studyDaysThisWeek)
                .totalWeeklyMinutes(totalWeeklyMinutes)
                .currentStreak(currentStreak)
                .avgDailyMinutes(avgDailyMinutes)
                .build();
    }

    private SimpleDashboardStatsDto.ReviewStats getReviewStats(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();

        try {
            // 1. 오늘 학습해야할 카드 수 (정확히 오늘 만기)
            int todayOnlyCards = cardStatRepository.countByMember_MemberIdAndDueAtBetween(memberId, startOfToday, endOfToday);

            // 2. 복습 미완료 카드 수 (오늘 이전)
            int overdueCards = cardStatRepository.countByMember_MemberIdAndDueAtBefore(memberId, startOfToday);

            // 3. 3일 내 학습해야할 카드 수 (내일 ~ 3일 뒤)
            LocalDateTime tomorrow = endOfToday;
            LocalDateTime in3Days = tomorrow.plusDays(3);
            int upcoming3DaysCards = cardStatRepository.countByMember_MemberIdAndDueAtBetween(memberId, tomorrow, in3Days);

            // 4. 오늘 완료한 복습 개수
            int completedReviews = cardStatRepository.countByMember_MemberIdAndLastReviewedAtBetween(memberId, startOfToday, now);
            
            return SimpleDashboardStatsDto.ReviewStats.builder()
                    .todayReviewCards(todayOnlyCards)
                    .overdueCards(overdueCards)
                    .upcoming3DaysCards(upcoming3DaysCards)
                    .completedReviews(completedReviews)
                    .mostDifficultCard("통계 준비중")
                    .build();
        } catch (Exception e) {
            log.warn("Failed to get review stats for member {}: {}", memberId, e.getMessage());
            return SimpleDashboardStatsDto.ReviewStats.builder()
                    .todayReviewCards(0)
                    .completedReviews(0)
                    .overdueCards(0)
                    .upcoming3DaysCards(0)
                    .mostDifficultCard("오류 발생")
                    .build();
        }
    }

    private List<LocalDate> getAttendanceDates(Long memberId) {
        YearMonth currentMonth = YearMonth.now();
        List<Date> sqlDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId,
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.atEndOfMonth().atTime(23, 59, 59)
        );
        return mapToLocalDate(sqlDates);
    }

    private SimpleDashboardStatsDto.TotalStats getTotalStats(Long memberId) {
        try {
            Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
            long totalNotes = noteRepository.findAllByMemberAndIsDeletedIsFalse(member).size();
            List<Deck> decks = deckRepository.findAllDecksByMemberIdAndIsDeletedFalse(memberId);
            List<String> deckIds = decks.stream().map(Deck::getDeckId).toList();
            long totalCards = 0;
            if (!deckIds.isEmpty()) {
                totalCards = cardRepository.findByDeckDeckIdInAndIsDeletedFalse(deckIds).size();
            }
            LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
            List<Date> allSqlDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                    memberId, oneYearAgo, LocalDateTime.now());
            List<LocalDate> allStudyDates = mapToLocalDate(allSqlDates);
            long totalStudyDays = allStudyDates.size();
            long totalFocusHours = totalStudyDays * 2;

            return SimpleDashboardStatsDto.TotalStats.builder()
                    .totalNotes(totalNotes)
                    .totalCards(totalCards)
                    .totalStudyDays(totalStudyDays)
                    .totalFocusHours(totalFocusHours)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to get total stats: {}", e.getMessage());
            return SimpleDashboardStatsDto.TotalStats.builder()
                    .totalNotes(0L)
                    .totalCards(0L)
                    .totalStudyDays(0L)
                    .totalFocusHours(0L)
                    .build();
        }
    }

    private int calculateSimpleStreak(Long memberId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Date> recentSqlDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId, thirtyDaysAgo, LocalDateTime.now());
        List<LocalDate> recentDates = mapToLocalDate(recentSqlDates);
        if (recentDates.isEmpty()) return 0;
        LocalDate today = LocalDate.now();
        int streak = 0;
        for (int i = 0; i < 30; i++) {
            LocalDate checkDate = today.minusDays(i);
            if (recentDates.contains(checkDate)) streak++;
            else break;
        }
        return streak;
    }

    // --------------------------------------------------------------------
    // 헬퍼: java.sql.Date 리스트 -> java.time.LocalDate 리스트 변환
    // --------------------------------------------------------------------
    private List<LocalDate> mapToLocalDate(List<Date> sqlDates) {
        return sqlDates.stream().map(Date::toLocalDate).toList();
    }
} 