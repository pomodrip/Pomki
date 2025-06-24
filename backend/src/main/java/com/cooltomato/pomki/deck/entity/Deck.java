package com.cooltomato.pomki.deck.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;
import com.cooltomato.pomki.card.entity.Card;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Entity
@Table(name = "card_deck")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Deck {
    
    @Id
    @Column(name = "deck_id", length = 50, nullable = false, unique = true)
    private String deckId;

    @PrePersist
    public void prePersist() {
        if (this.deckId == null) {
            this.deckId = java.util.UUID.randomUUID().toString();
        }
    }

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Card> cards = new ArrayList<>();

    @Column(name = "member_id")
    private Long memberId;

    @Column(name = "deck_name", nullable = false, length = 255)
    private String deckName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "card_cnt", nullable = false)
    private Long cardCnt = 0L;

}
