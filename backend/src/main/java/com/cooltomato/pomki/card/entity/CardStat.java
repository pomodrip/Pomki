package com.cooltomato.pomki.card.entity;

import com.cooltomato.pomki.member.entity.Member;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "CARD_STAT",
       uniqueConstraints = {
           @UniqueConstraint(
               name = "UK_card_member",
               columnNames = {"card_id", "member_id"}
           )
       })
@Getter
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

    // SM-2 알고리즘 핵심 필드들
    @Column(name = "repetitions", nullable = false)
    @Builder.Default
    private Integer repetitions = 0; // 연속 정답 횟수

    @Column(name = "ease_factor", nullable = false, precision = 4, scale = 2)
    @Builder.Default
    private BigDecimal easeFactor = new BigDecimal("2.50"); // 용이성 지수

    @Column(name = "interval_days", nullable = false)
    @Builder.Default
    private Integer intervalDays = 1; // 다음 복습까지 간격(일)

    // 스케줄링 관련
    @Column(name = "due_at", nullable = false)
    private LocalDateTime dueAt; // 다음 복습 예정일

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt; // 마지막 복습 시점

    // 품질 추적
    @Column(name = "last_quality")
    private Integer lastQuality; // 마지막 응답 품질 (0-5)

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

    // 비즈니스 메서드들
    public void updateAfterReview(Integer quality, Integer newRepetitions, 
                                  BigDecimal newEaseFactor, Integer newIntervalDays) {
        this.repetitions = newRepetitions;
        this.easeFactor = newEaseFactor;
        this.intervalDays = newIntervalDays;
        this.dueAt = LocalDateTime.now().plusDays(newIntervalDays);
        this.lastReviewedAt = LocalDateTime.now();
        this.lastQuality = quality;
        this.totalReviews = this.totalReviews + 1;
    }

    public boolean isDue() {
        return LocalDateTime.now().isAfter(this.dueAt) || LocalDateTime.now().isEqual(this.dueAt);
    }
} 