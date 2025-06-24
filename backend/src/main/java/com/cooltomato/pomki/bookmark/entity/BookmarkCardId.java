package com.cooltomato.pomki.bookmark.entity;

import java.io.Serializable;
import java.util.Objects;

public class BookmarkCardId implements Serializable {
    private Long member;
    private Long card;

    public BookmarkCardId() {}

    public BookmarkCardId(Long member, Long card) {
        this.member = member;
        this.card = card;
    }

    // equals, hashCode 필수!
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BookmarkCardId that = (BookmarkCardId) o;
        return Objects.equals(member, that.member) && Objects.equals(card, that.card);
    }

    @Override
    public int hashCode() {
        return Objects.hash(member, card);
    }
}