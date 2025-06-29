package com.cooltomato.pomki.cardtag.entity;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Entity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardTagId implements Serializable {
    private Long memberId;
    private String tagName;
    private Long cardId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CardTagId)) return false;
        CardTagId that = (CardTagId) o;
        return Objects.equals(getMemberId(), that.getMemberId()) &&
               Objects.equals(getTagName(), that.getTagName()) &&
               Objects.equals(getCardId(), that.getCardId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getMemberId(), getTagName(), getCardId());
    }
} 