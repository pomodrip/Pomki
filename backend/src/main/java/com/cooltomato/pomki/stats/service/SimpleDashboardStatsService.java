package com.cooltomato.pomki.stats.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.card.repository.CardStatRepository;
import com.cooltomato.pomki.card.service.ReviewService;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.stats.dto.SimpleDashboardStatsDto;
import com.cooltomato.pomki.stats.dto.TodayStatsDto;
import com.cooltomato.pomki.stats.repository.StudyLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SimpleDashboardStatsService {

    private final StudyLogRepository studyLogRepository;
    private final NoteRepository noteRepository;
    private final CardRepository cardRepository;
    private final CardStatRepository cardStatRepository;
    private final ReviewService reviewService;
    private final MemberRepository memberRepository;
    private final DeckRepository deckRepository;

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

    private SimpleDashboardStatsDto.TodayStudyStats getTodayStudyStats(Long memberId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        
        // 오늘의 통계 조회
        TodayStatsDto todayStats = studyLogRepository.getTodayStats(memberId, startOfDay);
        
        int goalMinutes = 240; // 기본 4시간
        int progressPercentage = goalMinutes > 0 ? 
                Math.min((int)((todayStats.getTotalFocusMinutes() * 100) / goalMinutes), 100) : 0;
        
        // 오늘 활동 수 계산 (간단하게)
        int todayActivities = (int)(todayStats.getTotalFocusMinutes() / 25); // 포모도로 기준 추정

        return SimpleDashboardStatsDto.TodayStudyStats.builder()
                .totalFocusMinutes(todayStats.getTotalFocusMinutes())
                .pomodoroCompleted((int)todayStats.getPomodoroSessionsCompleted())
                .goalMinutes(goalMinutes)
                .progressPercentage(progressPercentage)
                .todayActivities(todayActivities)
                .build();
    }

    private SimpleDashboardStatsDto.WeeklyStats getWeeklyStats(Long memberId) {
        // 이번 주 범위 계산
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(7);

        // 이번 주 활동일 조회
        List<LocalDate> weeklyDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId, startOfWeek, endOfWeek);
        
        int studyDaysThisWeek = weeklyDates.size();
        
        // 최근 7일 출석으로 대략적인 연속 일수 계산
        int currentStreak = calculateSimpleStreak(memberId);
        
        // 주간 총 시간 (근사치)
        long totalWeeklyMinutes = studyDaysThisWeek * 120; // 평균 2시간/일로 추정
        
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
        try {
            ReviewService.ReviewStats reviewStats = reviewService.getReviewStats(principal);
            
            return SimpleDashboardStatsDto.ReviewStats.builder()
                    .todayReviewCards(reviewStats.getTodayCards())
                    .completedReviews(reviewStats.getTodayCompleted())
                    .upcomingCards(reviewStats.getWithin7DaysCards())
                    .mostDifficultCard(reviewStats.getRecommendedCardTitle())
                    .build();
        } catch (Exception e) {
            log.warn("Failed to get review stats: {}", e.getMessage());
            return SimpleDashboardStatsDto.ReviewStats.builder()
                    .todayReviewCards(0)
                    .completedReviews(0)
                    .upcomingCards(0)
                    .mostDifficultCard("복습할 카드가 없습니다")
                    .build();
        }
    }

    private List<LocalDate> getAttendanceDates(Long memberId) {
        // 현재 월의 출석일 조회
        YearMonth currentMonth = YearMonth.now();
        return studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId,
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.atEndOfMonth().atTime(23, 59, 59)
        );
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

            // 총 학습 일수 (최근 1년)
            LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);
            List<LocalDate> allStudyDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                    memberId, oneYearAgo, LocalDateTime.now());
            long totalStudyDays = allStudyDates.size();
            
            // 총 집중 시간 추정 (일수 * 평균 2시간)
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
        // 최근 30일 활동일 조회
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<LocalDate> recentDates = studyLogRepository.findDistinctActivityDatesByMemberAndPeriod(
                memberId, thirtyDaysAgo, LocalDateTime.now());
        
        if (recentDates.isEmpty()) {
            return 0;
        }

        // 간단한 연속 일수 계산 (오늘부터 역산)
        LocalDate today = LocalDate.now();
        int streak = 0;
        
        for (int i = 0; i < 30; i++) {
            LocalDate checkDate = today.minusDays(i);
            if (recentDates.contains(checkDate)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
} 