package com.cooltomato.pomki.card.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "CARD_DECK")
@Getter
@Setter
@NoArgsConstructor
public class CardDeck {

    @Id
    @UuidGenerator
    @Column(name = "deck_id", length = 50)
    private String deckId;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "deck_name", nullable = false, length = 255)
    private String deckName;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public CardDeck(Long memberId, String deckName, String description, boolean isDeleted) {
        this.memberId = memberId;
        this.deckName = deckName;
        this.description = description;
        this.isDeleted = isDeleted;
    }
} 