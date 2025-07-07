package com.cooltomato.pomki.stats.entity;

import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.deck.entity.Deck;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "CARD_STAT")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class CardStat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_stat_id")
    private Long cardStatId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private Deck deck;

    @Column(name = "interval_days", nullable = false)
    @Builder.Default
    private Integer intervalDays = 1; // 다음 복습까지 간격(일)

    @Column(name = "due_at", nullable = false)
    private LocalDateTime dueAt; // 다음 복습 예정일

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt; // 마지막 복습 시점

    @Column(name = "last_difficulty", length = 20)
    private String lastDifficulty; // 마지막 선택 난이도 (hard/confuse/easy)

    @Column(name = "total_reviews", nullable = false)
    @Builder.Default
    private Integer totalReviews = 0; // 총 복습 횟수

    // 메타데이터
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 비즈니스 메서드
    /**
     * 사용자의 복습 응답(hard, confuse, easy)에 따라 카드의 다음 복습 상태를 업데이트합니다.
     * @param difficulty 사용자가 선택한 난이도
     */
    public void updateReviewStatus(String difficulty) {
        int daysToAdd;
        switch (difficulty.toLowerCase()) {
            case "hard":
                daysToAdd = 1;
                break;
            case "confuse":
                daysToAdd = 3;
                break;
            case "easy":
            default:
                daysToAdd = 5;
                break;
        }

        this.intervalDays = daysToAdd;
        this.dueAt = LocalDateTime.now().plusDays(daysToAdd);
        this.lastReviewedAt = LocalDateTime.now();
        this.lastDifficulty = difficulty;
        this.totalReviews = this.totalReviews + 1;
    }

    /**
     * 이 카드가 현재 복습할 시점인지 확인합니다.
     * @return 복습 기한이 지났거나 오늘이면 true
     */
    public boolean isDue() {
        return LocalDateTime.now().isAfter(this.dueAt) || LocalDateTime.now().isEqual(this.dueAt);
    }

    /**
     * 이 카드가 한 번도 복습된 적 없는 새 카드인지 확인합니다.
     * @return 총 복습 횟수가 0이면 true
     */
    public boolean isNewCard() {
        return totalReviews == 0;
    }
} 