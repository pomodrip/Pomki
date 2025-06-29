package com.cooltomato.pomki.notetag.entity;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteTagId implements Serializable {
    private Long memberId;
    private String tagName;
    private String noteId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof NoteTagId)) return false;
        NoteTagId that = (NoteTagId) o;
        return Objects.equals(getMemberId(), that.getMemberId()) &&
               Objects.equals(getTagName(), that.getTagName()) &&
               Objects.equals(getNoteId(), that.getNoteId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getMemberId(), getTagName(), getNoteId());
    }
} 