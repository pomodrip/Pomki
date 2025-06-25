package com.cooltomato.pomki.ai.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.cooltomato.pomki.deck.entity.Deck;
import java.time.LocalDateTime;

@Builder
@Entity
// @Table(name = "card") // AI
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AI {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "answer", nullable = false, columnDefinition = "TEXT")
    private String answer;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    // 의존관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "deck_id",
        referencedColumnName = "deck_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_card_deck")
    )
    private Deck deck;

    // // deck_id를 가져오는 편의 메서드
    // public String getDeckId() {
    //     return deck != null ? deck.getDeckId() : null;
    // }
} 