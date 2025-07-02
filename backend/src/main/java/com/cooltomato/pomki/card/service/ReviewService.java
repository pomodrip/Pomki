package com.cooltomato.pomki.card.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardReviewRequestDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.entity.CardStat;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.card.repository.CardStatRepository;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.stats.service.StudyLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReviewService {

    private final CardStatRepository cardStatRepository;
    private final CardRepository cardRepository;
    private final MemberRepository memberRepository;
    private final StudyLogService studyLogService;

    /**
     * 오늘 복습할 카드 목록 조회
     */
    public List<CardStat> getTodayReviewCards(PrincipalMember principal) {
        LocalDateTime now = LocalDateTime.now();
        return cardStatRepository.findDueCardsByMember(
                principal.getMemberInfo().getMemberId(), now);
    }

    /**
     * 🎯 최적화된 복습 카드 조회 (일일 제한 + 우선순위)
     */
    public List<CardStat> getOptimizedReviewCards(PrincipalMember principal, Integer maxCards) {
        LocalDateTime now = LocalDateTime.now();
        int dailyLimit = maxCards != null ? maxCards : calculateOptimalDailyLimit(principal);
        
        return cardStatRepository.findPriorityDueCards(
                principal.getMemberInfo().getMemberId(), now, dailyLimit);
    }

    /**
     * 📊 개인화된 일일 복습 한계 계산
     */
    private int calculateOptimalDailyLimit(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        // 최근 7일간 평균 복습 수 분석
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<java.sql.Date> recentStudyDates = cardStatRepository.getRecentStudyDates(memberId, weekAgo);
        
        if (recentStudyDates.isEmpty()) {
            return 20; // 신규 사용자 기본값
        }
        
        // 평균 활동도 기반 계산
        int activeDays = recentStudyDates.size();
        if (activeDays >= 5) {
            return 50; // 활발한 사용자
        } else if (activeDays >= 3) {
            return 30; // 보통 사용자
        } else {
            return 15; // 비활발한 사용자
        }
    }

    /**
     * 🔍 학습 성과 분석
     */
    public LearningAnalysis getLearningAnalysis(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        // 기본 통계
        Double avgEaseFactor = cardStatRepository.getAverageEaseFactor(memberId);
        Long totalCards = cardStatRepository.countByMemberMemberId(memberId);
        Long difficultCards = cardStatRepository.countDifficultCards(memberId);
        Long masteredCards = cardStatRepository.countMasteredCards(memberId);
        
        // 학습 패턴 분석
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> timePatterns = cardStatRepository.getReviewTimePatterns(memberId, monthAgo);
        
        // 학습 연속성
        List<java.sql.Date> studyDates = cardStatRepository.getRecentStudyDates(memberId, monthAgo);
        int studyStreak = calculateStudyStreak(studyDates);
        
        return LearningAnalysis.builder()
                .averageEaseFactor(avgEaseFactor != null ? avgEaseFactor : 2.5)
                .totalCards(totalCards)
                .difficultCards(difficultCards)
                .masteredCards(masteredCards)
                .studyStreak(studyStreak)
                .preferredStudyHour(findPreferredStudyTime(timePatterns))
                .masteryRate(totalCards > 0 ? (masteredCards.doubleValue() / totalCards * 100) : 0.0)
                .difficultyRate(totalCards > 0 ? (difficultCards.doubleValue() / totalCards * 100) : 0.0)
                .build();
    }

    /**
     * 🎯 취약한 카드 집중 복습 추천
     */
    public List<CardStat> getStrugglingCardsForReview(PrincipalMember principal, int limit) {
        return cardStatRepository.findStrugglingCards(
                principal.getMemberInfo().getMemberId(), 2.0, limit);
    }

    /**
     * 📈 학습 부하 조절 추천
     */
    public StudyLoadRecommendation getStudyLoadRecommendation(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        LocalDateTime now = LocalDateTime.now();
        
        // 오늘 예정된 복습 수
        List<CardStat> todayCards = cardStatRepository.findDueCardsByMember(memberId, now);
        int todayDue = todayCards.size();
        
        // 향후 3일간 예정된 복습 수
        long next3Days = cardStatRepository.countDueCardsInPeriod(
                memberId, now, now.plusDays(3));
        
        // 향후 7일간 예정된 복습 수
        long next7Days = cardStatRepository.countDueCardsInPeriod(
                memberId, now, now.plusDays(7));
        
        // 추천 메시지 생성
        String recommendation;
        StudyLoadLevel loadLevel;
        
        if (todayDue <= 10) {
            loadLevel = StudyLoadLevel.LIGHT;
            recommendation = "여유로운 하루입니다! 새로운 카드를 추가해보세요.";
        } else if (todayDue <= 30) {
            loadLevel = StudyLoadLevel.MODERATE;
            recommendation = "적당한 학습량입니다. 꾸준히 진행하세요!";
        } else if (todayDue <= 50) {
            loadLevel = StudyLoadLevel.HEAVY;
            recommendation = "오늘은 조금 무거운 하루네요. 천천히 진행하세요.";
        } else {
            loadLevel = StudyLoadLevel.OVERWHELMING;
            recommendation = "학습량이 많습니다. 일부 카드는 내일로 미뤄도 좋습니다.";
        }
        
        return StudyLoadRecommendation.builder()
                .todayDueCards(todayDue)
                .next3DaysCards((int)next3Days)
                .next7DaysCards((int)next7Days)
                .loadLevel(loadLevel)
                .recommendation(recommendation)
                .recommendedDailyLimit(calculateOptimalDailyLimit(principal))
                .build();
    }

    // 헬퍼 메서드들
    private int calculateStudyStreak(List<java.sql.Date> studyDates) {
        if (studyDates.isEmpty()) return 0;
        
        LocalDate today = LocalDate.now();
        int streak = 0;
        
        for (java.sql.Date sqlDate : studyDates) {
            LocalDate studyDate = sqlDate.toLocalDate();
            LocalDate expectedDate = today.minusDays(streak);
            
            if (studyDate.equals(expectedDate)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    private int findPreferredStudyTime(List<Object[]> timePatterns) {
        if (timePatterns.isEmpty()) return 20; // 기본값: 오후 8시
        
        Object[] mostActiveTime = timePatterns.get(0);
        return (Integer) mostActiveTime[0];
    }

    // 내부 클래스들
    @lombok.Builder
    @lombok.Getter
    public static class LearningAnalysis {
        private final double averageEaseFactor;    // 평균 용이성 지수
        private final long totalCards;             // 총 카드 수
        private final long difficultCards;         // 어려운 카드 수 (EF < 2.0)
        private final long masteredCards;          // 숙련된 카드 수 (repetitions >= 3)
        private final int studyStreak;             // 연속 학습 일수
        private final int preferredStudyHour;      // 선호 학습 시간
        private final double masteryRate;          // 숙련도 비율 (%)
        private final double difficultyRate;       // 어려움 비율 (%)
    }

    @lombok.Builder
    @lombok.Getter
    public static class StudyLoadRecommendation {
        private final int todayDueCards;           // 오늘 복습 예정 카드
        private final int next3DaysCards;          // 3일 내 복습 예정
        private final int next7DaysCards;          // 7일 내 복습 예정
        private final StudyLoadLevel loadLevel;    // 학습 부하 수준
        private final String recommendation;       // 추천 메시지
        private final int recommendedDailyLimit;   // 권장 일일 복습 수
    }

    public enum StudyLoadLevel {
        LIGHT("가벼움"),
        MODERATE("적당함"),
        HEAVY("무거움"),
        OVERWHELMING("과부하");
        
        private final String description;
        
        StudyLoadLevel(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }

    /**
     * 카드 복습 완료 처리 (SM-2 알고리즘 적용)
     */
    @Transactional
    public void completeCardReview(Long cardId, String difficulty, PrincipalMember principal) {
        Member member = memberRepository.findById(principal.getMemberInfo().getMemberId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("카드를 찾을 수 없습니다."));

        // 기존 통계 조회 또는 신규 생성
        Optional<CardStat> existingStatOpt = cardStatRepository
                .findByMemberMemberIdAndCardCardId(member.getMemberId(), cardId);

        CardStat cardStat;
        if (existingStatOpt.isPresent()) {
            cardStat = existingStatOpt.get();
        } else {
            // 첫 복습인 경우 새로운 통계 생성
            cardStat = CardStat.builder()
                    .card(card)
                    .member(member)
                    .deck(card.getDeck())
                    .dueAt(LocalDateTime.now().plusDays(1))
                    .build();
        }

        // SM-2 알고리즘 적용
        int quality = mapDifficultyToQuality(difficulty);
        SM2Result sm2Result = calculateSM2Interval(quality, cardStat.getRepetitions(), 
                                                   cardStat.getEaseFactor(), cardStat.getIntervalDays());

        // 통계 업데이트
        cardStat.updateAfterReview(
                quality,
                difficulty,
                sm2Result.repetitions,
                sm2Result.easeFactor,
                sm2Result.intervalDays
        );

        cardStatRepository.save(cardStat);
        log.info("카드 복습 완료: cardId={}, difficulty={}, nextReview={}, interval={}일", 
                cardId, difficulty, cardStat.getDueAt(), sm2Result.intervalDays);
        
        // 학습 활동 기록 (출석 캘린더용)
        Map<String, Object> details = Map.of(
                "card_id", cardId,
                "difficulty", difficulty,
                "next_review_days", sm2Result.intervalDays,
                "ease_factor", sm2Result.easeFactor.doubleValue(),
                "repetitions", sm2Result.repetitions,
                "duration_minutes", calculateReviewDuration(difficulty)
        );
        studyLogService.recordActivity(
                member.getMemberId(),
                "CARD_REVIEWED",
                details
        );
    }

    /**
     * 카드 복습 완료 처리 (단순화된 버전)
     */
    @Transactional
    public void completeCardReviewSimple(Long cardId, String difficulty, PrincipalMember principal) {
        Member member = memberRepository.findById(principal.getMemberInfo().getMemberId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("카드를 찾을 수 없습니다."));

        CardStat cardStat = cardStatRepository.findByMemberMemberIdAndCardCardId(member.getMemberId(), cardId)
                .orElseGet(() -> CardStat.builder()
                        .card(card)
                        .member(member)
                        .deck(card.getDeck())
                        .dueAt(LocalDateTime.now())
                        .build());

        int intervalDays = mapDifficultyToSimpleInterval(difficulty);

        cardStat.updateAfterReview(
                null, // quality
                difficulty,
                cardStat.getRepetitions() + 1,
                cardStat.getEaseFactor(),
                intervalDays
        );

        cardStat.setLastReviewedAt(LocalDateTime.now());
        
        cardStatRepository.save(cardStat);

        // 학습 로그 기록
        Map<String, Object> details = new HashMap<>();
        details.put("cardId", card.getCardId());
        details.put("deckId", card.getDeck().getDeckId());
        details.put("difficulty", difficulty);
        details.put("durationSeconds", calculateReviewDuration(difficulty));

        studyLogService.recordActivity(
                member.getMemberId(),
                "CARD_REVIEW",
                details
        );
    }

    /**
     * 난이도를 SM-2 품질 점수로 매핑
     * 0: 완전히 기억 못함, 1: 틀렸지만 정답을 알았을 때 기억남
     * 2: 틀렸지만 쉽게 기억해냄, 3: 맞았지만 어려웠음
     * 4: 맞았고 약간의 주저가 있었음, 5: 완벽하게 기억함
     */
    private int mapDifficultyToQuality(String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "again":
            case "다시":
            case "잊음":
                return 0; // 완전히 기억 못함
            case "hard":
            case "어려움":
            case "헷갈림":
                return 2; // 맞았지만 매우 어려웠음
            case "good":
            case "괜찮음":
            case "좋음":
                return 4; // 맞았고 약간의 주저
            case "easy":
            case "쉬움":
                return 5; // 완벽하게 기억함
            default:
                return 3; // 기본값
        }
    }

    /**
     * SM-2 알고리즘 구현
     * @param quality 응답 품질 (0-5)
     * @param repetitions 현재 반복 횟수
     * @param easeFactor 현재 용이성 지수
     * @param currentInterval 현재 간격
     * @return SM2Result 계산 결과
     */
    private SM2Result calculateSM2Interval(int quality, int repetitions, 
                                          BigDecimal easeFactor, int currentInterval) {
        BigDecimal newEaseFactor = easeFactor;
        int newRepetitions = repetitions;
        int newInterval;

        // EF(용이성 지수) 업데이트
        if (quality >= 3) {
            // 정답인 경우
            newRepetitions++;
            
            // EF 계산: EF' = EF + (0.1 - (5-q)*(0.08+(5-q)*0.02))
            double efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
            newEaseFactor = easeFactor.add(BigDecimal.valueOf(efChange));
            
            // EF는 최소 1.3으로 제한
            if (newEaseFactor.compareTo(BigDecimal.valueOf(1.3)) < 0) {
                newEaseFactor = BigDecimal.valueOf(1.3);
            }
            
            // 간격 계산
            if (newRepetitions == 1) {
                newInterval = 1; // 첫 번째 복습: 1일
            } else if (newRepetitions == 2) {
                newInterval = 6; // 두 번째 복습: 6일
            } else {
                // 세 번째부터: I(n) = I(n-1) * EF
                newInterval = Math.round(currentInterval * newEaseFactor.floatValue());
            }
        } else {
            // 틀린 경우: 처음부터 다시 시작
            newRepetitions = 0;
            newInterval = 1;
            // EF는 약간 감소 (최소 1.3 유지)
            newEaseFactor = easeFactor.subtract(BigDecimal.valueOf(0.2));
            if (newEaseFactor.compareTo(BigDecimal.valueOf(1.3)) < 0) {
                newEaseFactor = BigDecimal.valueOf(1.3);
            }
        }

        // 간격 최대값 제한 (6개월)
        if (newInterval > 180) {
            newInterval = 180;
        }

        return new SM2Result(newRepetitions, newEaseFactor, newInterval);
    }

    /**
     * SM-2 계산 결과를 담는 내부 클래스
     */
    private static class SM2Result {
        final int repetitions;
        final BigDecimal easeFactor;
        final int intervalDays;

        SM2Result(int repetitions, BigDecimal easeFactor, int intervalDays) {
            this.repetitions = repetitions;
            this.easeFactor = easeFactor;
            this.intervalDays = intervalDays;
        }
    }

    /**
     * 난이도에 따른 예상 복습 시간 계산 (분)
     */
    private int calculateReviewDuration(String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "again":
                return 60; // 1분
            case "hard":
            case "confuse":
                return 45; // 45초
            case "good":
                return 30; // 30초
            case "easy":
                return 15; // 15초
            default:
                return 30; // 기본값
        }
    }

    /**
     * 사용자의 복습 통계 조회 (대시보드용)
     */
    public ReviewStats getReviewStats(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        // 오늘 복습할 카드 수
        List<CardStat> todayCards = cardStatRepository.findDueCardsByMember(memberId, now);

        // 오늘 복습 완료한 카드 수
        Long todayCompleted = cardStatRepository.countTodayReviewedCards(memberId, startOfDay, endOfDay);

        // 3일 내 복습 예정 카드 수
        Long within3Days = cardStatRepository.countDueCardsInPeriod(memberId, now, now.plusDays(3));

        // 7일 내 복습 예정 카드 수
        Long within7Days = cardStatRepository.countDueCardsInPeriod(memberId, now, now.plusDays(7));

        return ReviewStats.builder()
                .todayCards(todayCards.size())
                .todayCompleted(todayCompleted.intValue())
                .within3DaysCards(within3Days.intValue())
                .within7DaysCards(within7Days.intValue())
                .recommendedCardTitle(todayCards.isEmpty() ? "복습할 카드가 없습니다" : "복습할 카드가 있습니다")
                .build();
    }

    // 내부 DTO 클래스
    @lombok.Builder
    @lombok.Getter
    public static class ReviewStats {
        private final int todayCards;
        private final int todayCompleted;
        private final int within3DaysCards;
        private final int within7DaysCards;
        private final String recommendedCardTitle;
    }

    /**
     * 🎯 단순화된 학습 주기 시스템 (사용자 요청)
     * hard: 1일, confuse: 3일, easy: 5일
     */
    @Transactional
    public void completeStudySession(List<CardReviewRequestDto> reviewRequests, PrincipalMember principal) {
        Member member = memberRepository.findById(principal.getMemberInfo().getMemberId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        for (CardReviewRequestDto request : reviewRequests) {
            processSingleReview(request.getCardId(), request.getDifficulty(), member);
        }

        log.info("학습 세션 완료: memberId={}, reviewCount={}", member.getMemberId(), reviewRequests.size());
        
        studyLogService.recordActivity(
                member.getMemberId(),
                "STUDY_SESSION_COMPLETED",
                Map.of("reviewed_card_count", reviewRequests.size())
        );
    }

    private void processSingleReview(Long cardId, String difficulty, Member member) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("카드를 찾을 수 없습니다: " + cardId));

        CardStat cardStat = cardStatRepository.findByMemberMemberIdAndCardCardId(member.getMemberId(), cardId)
                .orElseGet(() -> CardStat.builder()
                        .card(card)
                        .member(member)
                        .deck(card.getDeck())
                        .dueAt(LocalDateTime.now())
                        .build());

        int intervalDays = mapDifficultyToSimpleInterval(difficulty);
        int quality = mapDifficultyToQuality(difficulty);

        cardStat.updateAfterReview(
                quality,
                difficulty,
                cardStat.getRepetitions() + (quality >= 3 ? 1 : 0),
                cardStat.getEaseFactor(),
                intervalDays
        );
        cardStatRepository.save(cardStat);
    }

    private int mapDifficultyToSimpleInterval(String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "hard": return 1;
            case "confuse":
            case "confusing": return 3;
            case "easy": return 5;
            default: return 3;
        }
    }
} 