package com.cooltomato.pomki.tag.entity;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagId implements Serializable {
    private String tagName;
    private Long memberId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TagId)) return false;
        TagId tagId = (TagId) o;
        return Objects.equals(getTagName(), tagId.getTagName()) &&
               Objects.equals(getMemberId(), tagId.getMemberId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getTagName(), getMemberId());
    }
} 