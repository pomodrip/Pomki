package com.cooltomato.pomki.tag.entity;

import jakarta.persistence.*;
import lombok.*;
import com.cooltomato.pomki.card.entity.Card;

@Entity
@Table(name = "tag_card")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagCard {

    @EmbeddedId
    private TagCardId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cardId")
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TagCardId {
        private Long cardId;
        private Long tagId;
    }
} 