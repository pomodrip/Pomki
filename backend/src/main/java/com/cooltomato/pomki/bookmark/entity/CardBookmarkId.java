package com.cooltomato.pomki.bookmark.entity;

import java.io.Serializable;
import java.util.Objects;

import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.member.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardBookmarkId implements Serializable {
    
    private Member member;
    private Card card;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardBookmarkId that = (CardBookmarkId) o;
        return Objects.equals(member, that.member) &&
               Objects.equals(card, that.card);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(member, card);
    }
} 