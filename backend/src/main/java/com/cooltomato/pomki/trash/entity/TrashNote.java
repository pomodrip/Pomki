package com.cooltomato.pomki.trash.entity;

import com.cooltomato.pomki.note.entity.Note;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TRASH_NOTE")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrashNote {
    
    @EmbeddedId
    private TrashNoteId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trash_id", insertable = false, updatable = false)
    private Trash trash;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", insertable = false, updatable = false)
    private Note note;
    
    // 편의 메서드
    public String getNoteId() {
        return id != null ? id.getNoteId() : null;
    }
    
    public String getTrashId() {
        return id != null ? id.getTrashId() : null;
    }
} 