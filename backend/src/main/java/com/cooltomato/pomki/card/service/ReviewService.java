package com.cooltomato.pomki.card.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
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
import java.time.LocalDateTime;
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
     * 카드 복습 완료 처리 (단순화된 알고리즘)
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
                    .dueAt(LocalDateTime.now().plusDays(1)) // 기본 1일 후
                    .build();
        }

        // 단순화된 알고리즘 적용
        int quality = mapDifficultyToQuality(difficulty);
        int newIntervalDays = calculateSimpleInterval(difficulty, cardStat.getRepetitions());
        int newRepetitions = quality >= 3 ? cardStat.getRepetitions() + 1 : 0;

        // 통계 업데이트
        cardStat.updateAfterReview(
                quality,
                newRepetitions,
                cardStat.getEaseFactor(), // 단순화를 위해 ease factor는 고정
                newIntervalDays
        );

        cardStatRepository.save(cardStat);
        log.info("카드 복습 완료: cardId={}, difficulty={}, nextReview={}", 
                cardId, difficulty, cardStat.getDueAt());
        
        // 학습 활동 기록 (출석 캘린더용)
        Map<String, Object> details = Map.of(
                "card_id", cardId,
                "difficulty", difficulty,
                "next_review_days", newIntervalDays,
                "duration_minutes", calculateReviewDuration(difficulty) // 난이도에 따른 예상 시간
        );
        studyLogService.recordActivity(
                member.getMemberId(),
                "CARD_REVIEWED",
                details
        );
    }

    /**
     * 난이도를 품질 점수로 매핑 (단순화)
     */
    private int mapDifficultyToQuality(String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "easy":
            case "쉬움":
                return 5;
            case "good":
            case "괜찮음":
            case "좋음":
                return 4;
            case "hard":
            case "어려움":
            case "헷갈림":
                return 3;
            case "again":
            case "다시":
            case "잊음":
                return 1;
            default:
                return 3; // 기본값
        }
    }

    /**
     * 단순화된 간격 계산 (SM-2 대신)
     */
    private int calculateSimpleInterval(String difficulty, int currentRepetitions) {
        switch (difficulty.toLowerCase()) {
            case "easy":
            case "쉬움":
                return Math.max(7, currentRepetitions * 2); // 최소 7일
            case "good":
            case "괜찮음":
            case "좋음":
                return Math.max(3, currentRepetitions + 1); // 최소 3일
            case "hard":
            case "어려움":
            case "헷갈림":
                return 1; // 1일 후 다시
            case "again":
            case "다시":
            case "잊음":
                return 1; // 1일 후 다시
            default:
                return 3; // 기본 3일
        }
    }

    /**
     * 난이도에 따른 예상 복습 시간 계산 (분)
     */
    private int calculateReviewDuration(String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "easy":
            case "쉬움":
                return 1; // 1분
            case "good":
            case "괜찮음":
            case "좋음":
                return 2; // 2분
            case "hard":
            case "어려움":
            case "헷갈림":
                return 3; // 3분
            case "again":
            case "다시":
            case "잊음":
                return 4; // 4분
            default:
                return 2; // 기본 2분
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
                .recommendedCardTitle(todayCards.isEmpty() ? "복습할 카드가 없습니다" :
                                     todayCards.get(0).getCard().getContent())
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
} 