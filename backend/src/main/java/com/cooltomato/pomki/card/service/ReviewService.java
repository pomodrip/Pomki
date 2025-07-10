package com.cooltomato.pomki.card.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.dto.CardReviewRequestDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.stats.entity.CardStat;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.stats.repository.CardStatRepository;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ReviewService {

    private final CardStatRepository cardStatRepository;
    private final MemberRepository memberRepository;
    private final CardRepository cardRepository;

    /**
     * 오늘 복습해야 할 모든 카드를 조회합니다.
     * 복습 기한(dueAt)이 오늘이거나 이미 지난 카드들이 대상입니다.
     *
     * @param principal 현재 로그인한 사용자 정보
     * @return 오늘 복습할 카드 DTO 리스트
     */
    public List<CardResponseDto> getTodayReviewCards(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        LocalDateTime now = LocalDateTime.now();

        List<CardStat> dueCardStats = cardStatRepository.findByMember_MemberIdAndDueAtLessThanEqualOrderByDueAtAsc(memberId, now);

        return dueCardStats.stream()
                .map(cardStat -> {
                    Card card = cardStat.getCard();
                    return CardResponseDto.builder()
                            .cardId(card.getCardId())
                            .content(card.getContent())
                            .answer(card.getAnswer())
                            .deckId(card.getDeck().getDeckId())
                            .deckName(card.getDeck().getDeckName())
                            .createdAt(card.getCreatedAt())
                            .updatedAt(card.getUpdatedAt())
                            .isDeleted(card.getIsDeleted())
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * 오늘 복습할 카드의 개수를 조회합니다.
     * 대시보드 등에서 간단한 통계가 필요할 때 사용됩니다.
     *
     * @param principal 현재 로그인한 사용자 정보
     * @return 오늘 복습할 카드의 총 개수
     */
    public int getTodayReviewCardCount(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        LocalDateTime now = LocalDateTime.now();
        return cardStatRepository.countByMember_MemberIdAndDueAtLessThanEqual(memberId, now);
    }

    /**
     * 여러 카드의 복습 결과를 일괄 처리합니다.
     * 'hard': 1일, 'confuse': 3일, 'easy': 5일 뒤로 다음 복습 날짜를 설정합니다.
     *
     * @param reviewRequests 복습 결과 요청 DTO 리스트
     * @param principal 현재 로그인한 사용자 정보
     */
    @Transactional
    public void batchCompleteReview(List<CardReviewRequestDto> reviewRequests, PrincipalMember principal) {
        Member member = memberRepository.findById(principal.getMemberInfo().getMemberId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다. ID: " + principal.getMemberInfo().getMemberId()));

        for (CardReviewRequestDto request : reviewRequests) {
            CardStat cardStat = cardStatRepository
                    .findByMemberAndCard_CardId(member, request.getCardId())
                    .orElseGet(() -> createCardStat(member, request.getCardId()));

            // CardStat 엔티티의 비즈니스 메서드를 호출하여 상태 업데이트
            cardStat.updateReviewStatus(request.getDifficulty());
            cardStatRepository.save(cardStat);
        }

        log.info("학습 세션 완료: memberId={}, reviewCount={}", member.getMemberId(), reviewRequests.size());
    }

    /**
     * 새로운 CardStat을 생성합니다.
     * 새 카드의 경우 학습 기록이 없으므로 기본값으로 초기화합니다.
     *
     * @param member 사용자 엔티티
     * @param cardId 카드 ID
     * @return 새로 생성된 CardStat
     */
    private CardStat createCardStat(Member member, Long cardId) {
        Card card = cardRepository.findByCardIdAndIsDeletedFalse(cardId)
                .orElseThrow(() -> new NotFoundException("카드를 찾을 수 없습니다. ID: " + cardId));
        
        CardStat newCardStat = CardStat.builder()
                .card(card)
                .member(member)
                .deck(card.getDeck())
                .intervalDays(1)
                .dueAt(LocalDateTime.now()) // 즉시 복습 가능
                .totalReviews(0)
                .build();
        
        log.info("새로운 학습 기록 생성: memberId={}, cardId={}", member.getMemberId(), cardId);
        return cardStatRepository.save(newCardStat);
    }

    private CardResponseDto mapToCardResponseDto(CardStat cardStat) {
        Card card = cardStat.getCard();
        return CardResponseDto.builder()
            .cardId(card.getCardId())
            .content(card.getContent())
            .answer(card.getAnswer())
            .deckId(card.getDeck().getDeckId())
            .createdAt(card.getCreatedAt())
            .updatedAt(card.getUpdatedAt())
            .isDeleted(card.getIsDeleted())
            .build();
    }

    private List<CardResponseDto> getCardsByDateRange(Long memberId, LocalDateTime start, LocalDateTime end) {
        return cardStatRepository.findByMember_MemberIdAndDueAtBetweenOrderByDueAtAsc(memberId, start, end)
            .stream()
            .map(this::mapToCardResponseDto)
            .collect(Collectors.toList());
    }

    public List<CardResponseDto> getCardsForToday(PrincipalMember principal) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();
        return getCardsByDateRange(principal.getMemberId(), startOfToday, endOfToday);
    }

    public List<CardResponseDto> getOverdueCards(PrincipalMember principal) {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        return cardStatRepository.findByMember_MemberIdAndDueAtBeforeOrderByDueAtAsc(principal.getMemberId(), startOfToday)
            .stream()
            .map(this::mapToCardResponseDto)
            .collect(Collectors.toList());
    }

    public List<CardResponseDto> getUpcomingCards(PrincipalMember principal) {
        LocalDateTime tomorrow = LocalDate.now().plusDays(1).atStartOfDay();
        LocalDateTime endOfPeriod = tomorrow.plusDays(3);
        return getCardsByDateRange(principal.getMemberId(), tomorrow, endOfPeriod);
    }
}