package com.cooltomato.pomki.card.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "CARD_STAT")
@Getter
@Setter
@NoArgsConstructor
public class CardStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stat_id")
    private Long statId;

    @Column(name = "card_id", nullable = false)
    private Long cardId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @CreationTimestamp
    @Column(name = "review_timestamp", nullable = false)
    private LocalDateTime reviewTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_rating", nullable = false)
    private UserRating userRating;

    @Column(name = "previous_interval")
    private Integer previousInterval; // 이전 복습으로부터 경과된 시간(일)

    @Column(name = "new_interval")
    private Integer newInterval; // 이번 복습 후 계산된 새로운 복습 간격(일)

    @Column(name = "stability")
    private Float stability; // 기억이 얼마나 오래 지속되는지를 나타내는 지표

    @Column(name = "difficulty")
    private Float difficulty; // 카드의 고유한 내재적 어려움

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false)
    private CardState state;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;

    public enum UserRating {
        AGAIN, HARD, GOOD, EASY
    }

    public enum CardState {
        NEW, LEARNING, REVIEW
    }

    @Builder
    public CardStat(Long cardId, Long memberId, UserRating userRating, Integer previousInterval,
                   Integer newInterval, Float stability, Float difficulty, CardState state,
                   LocalDateTime nextReviewAt) {
        this.cardId = cardId;
        this.memberId = memberId;
        this.userRating = userRating;
        this.previousInterval = previousInterval;
        this.newInterval = newInterval;
        this.stability = stability;
        this.difficulty = difficulty;
        this.state = state != null ? state : CardState.NEW;
        this.nextReviewAt = nextReviewAt;
    }
} 