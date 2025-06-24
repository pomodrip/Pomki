package com.cooltomato.pomki.bookmark.entity;

import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.card.entity.Card;
import jakarta.persistence.*;
import lombok.*;

@Entity
@IdClass(BookmarkCardId.class)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkCard {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;
}