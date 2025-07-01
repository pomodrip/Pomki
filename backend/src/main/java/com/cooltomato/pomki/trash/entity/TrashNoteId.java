package com.cooltomato.pomki.trash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrashNoteId implements Serializable {
    
    @Column(name = "note_id", length = 50, nullable = false)
    private String noteId;
    
    @Column(name = "trash_id", length = 50, nullable = false)
    private String trashId;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TrashNoteId that = (TrashNoteId) o;
        return Objects.equals(noteId, that.noteId) &&
               Objects.equals(trashId, that.trashId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(noteId, trashId);
    }
} 