package com.cooltomato.pomki.card.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.cooltomato.pomki.bookmark.entity.CardBookmark;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.cardtag.entity.CardTag;
// import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.trash.entity.TrashCard;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Builder
@Entity
@Table(name = "card")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Card {
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

    // CardTag와의 양방향 관계
    @OneToMany(mappedBy = "card", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CardTag> cardTags = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TrashCard> trashCards = new ArrayList<>();

    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CardBookmark> cardBookmarks = new ArrayList<>();

} 