package com.cooltomato.pomki.card.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.StudyCycleDashboardDto;
import com.cooltomato.pomki.card.entity.CardStat;
import com.cooltomato.pomki.card.repository.CardStatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 학습 주기 대시보드 서비스
 * hard: 1일, confuse: 3일, easy: 5일 시스템
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class StudyCycleDashboardService {

    private final CardStatRepository cardStatRepository;

    /**
     * 학습 주기 대시보드 데이터 조회
     */
    public StudyCycleDashboardDto getDashboardData(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        LocalDateTime now = LocalDateTime.now();
        
        // 날짜별 시간 경계 계산
        LocalDateTime endOfToday = now.withHour(23).withMinute(59).withSecond(59);
        LocalDateTime startOfYesterday = now.minusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfYesterday = now.minusDays(1).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime startOfTomorrow = now.plusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfTomorrow = now.plusDays(1).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime threeDaysAgo = now.minusDays(3).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime twoDaysAgo = now.minusDays(2).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime tomorrow = startOfTomorrow;
        LocalDateTime threeDaysLater = now.plusDays(3).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime fiveDaysLater = now.plusDays(5).withHour(23).withMinute(59).withSecond(59);

        // 각 카테고리별 카드 조회
        List<CardStat> todayCards = cardStatRepository.findTodayDueCards(memberId, endOfToday);
        List<CardStat> overdueCards = cardStatRepository.findOverdueCards(memberId, threeDaysAgo, twoDaysAgo);
        List<CardStat> yesterdayCards = cardStatRepository.findYesterdayDueCards(memberId, startOfYesterday, endOfYesterday);
        List<CardStat> tomorrowCards = cardStatRepository.findTomorrowDueCards(memberId, startOfTomorrow, endOfTomorrow);
        List<CardStat> within3DaysCards = cardStatRepository.findWithin3DaysCards(memberId, tomorrow, threeDaysLater);
        List<CardStat> within5DaysCards = cardStatRepository.findWithin5DaysCards(memberId, tomorrow, fiveDaysLater);

        // 오늘 완료한 카드 수 계산
        LocalDateTime startOfToday = now.withHour(0).withMinute(0).withSecond(0);
        Long completedTodayCount = cardStatRepository.countTodayReviewedCards(memberId, startOfToday, endOfToday);

        // DTO 변환
        List<StudyCycleDashboardDto.StudyCardInfo> todayCardInfos = 
                convertToCardInfos(todayCards, "today", now);
        List<StudyCycleDashboardDto.StudyCardInfo> overdueCardInfos = 
                convertToCardInfos(overdueCards, "overdue", now);
        List<StudyCycleDashboardDto.StudyCardInfo> yesterdayCardInfos = 
                convertToCardInfos(yesterdayCards, "yesterday", now);
        List<StudyCycleDashboardDto.StudyCardInfo> tomorrowCardInfos = 
                convertToCardInfos(tomorrowCards, "tomorrow", now);
        List<StudyCycleDashboardDto.StudyCardInfo> within3DaysCardInfos = 
                convertToCardInfos(within3DaysCards, "within3days", now);
        List<StudyCycleDashboardDto.StudyCardInfo> within5DaysCardInfos = 
                convertToCardInfos(within5DaysCards, "within5days", now);

        // 통계 정보 생성
        StudyCycleDashboardDto.StudyStats stats = StudyCycleDashboardDto.StudyStats.builder()
                .todayCount(todayCards.size())
                .overdueCount(overdueCards.size())
                .yesterdayCount(yesterdayCards.size())
                .tomorrowCount(tomorrowCards.size())
                .within3DaysCount(within3DaysCards.size())
                .within5DaysCount(within5DaysCards.size())
                .totalActiveCards(todayCards.size() + overdueCards.size() + yesterdayCards.size() + 
                                 tomorrowCards.size() + within3DaysCards.size() + within5DaysCards.size())
                .completedTodayCount(completedTodayCount.intValue())
                .build();

        // 권장 메시지 생성
        String recommendation = generateRecommendation(stats);
        boolean hasStudyToday = stats.getTodayCount() > 0 || stats.getOverdueCount() > 0;

        return StudyCycleDashboardDto.builder()
                .todayCards(todayCardInfos)
                .overdueCards(overdueCardInfos)
                .yesterdayCards(yesterdayCardInfos)
                .tomorrowCards(tomorrowCardInfos)
                .within3DaysCards(within3DaysCardInfos)
                .within5DaysCards(within5DaysCardInfos)
                .stats(stats)
                .recommendation(recommendation)
                .hasStudyToday(hasStudyToday)
                .build();
    }

    /**
     * CardStat 리스트를 StudyCardInfo 리스트로 변환
     */
    private List<StudyCycleDashboardDto.StudyCardInfo> convertToCardInfos(
            List<CardStat> cardStats, String status, LocalDateTime now) {
        return cardStats.stream()
                .<StudyCycleDashboardDto.StudyCardInfo>map(cardStat -> {
                    // 카드 내용 요약 (처음 50자)
                    String content = cardStat.getCard().getContent();
                    String summary = content.length() > 50 ? content.substring(0, 50) + "..." : content;
                    
                    // 지연 일수 계산
                    long daysOverdue = ChronoUnit.DAYS.between(cardStat.getDueAt(), now);
                    
                    // 마지막 난이도 추정 (간격을 기반으로)
                    Integer estimatedDifficulty = estimateDifficultyFromInterval(cardStat.getIntervalDays());
                    
                                         return StudyCycleDashboardDto.StudyCardInfo.builder()
                             .cardId(cardStat.getCard().getCardId())
                             .content(summary)
                             .deckName(cardStat.getCard().getDeck().getDeckName())
                             .deckId(cardStat.getCard().getDeck().getDeckId())
                             .dueAt(cardStat.getDueAt())
                             .difficulty(estimatedDifficulty)
                             .totalReviews(cardStat.getTotalReviews())
                             .status(status)
                             .daysOverdue((int) daysOverdue)
                             .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 간격을 기반으로 난이도 추정
     */
    private Integer estimateDifficultyFromInterval(Integer intervalDays) {
        if (intervalDays == null) return 3; // 기본값
        
        if (intervalDays <= 1) return 1;    // hard
        else if (intervalDays <= 3) return 3; // confuse  
        else return 5; // easy
    }

    /**
     * 통계를 기반으로 권장 메시지 생성
     */
    private String generateRecommendation(StudyCycleDashboardDto.StudyStats stats) {
        int totalPending = stats.getTodayCount() + stats.getOverdueCount();
        
        if (totalPending == 0) {
            return "🎉 모든 복습을 완료했습니다! 새로운 카드를 추가해보세요.";
        } else if (stats.getOverdueCount() > 10) {
            return "⚠️ 지연된 카드가 많습니다. 우선 지연된 카드부터 복습해보세요.";
        } else if (totalPending > 20) {
            return "📚 오늘 복습할 카드가 많습니다. 조금씩 나누어서 진행하세요.";
        } else if (totalPending > 0) {
            return "✨ 오늘 복습할 카드가 있습니다. 지금 시작해보세요!";
        } else {
            return "👍 좋은 페이스입니다! 꾸준히 학습을 이어가세요.";
        }
    }
} 