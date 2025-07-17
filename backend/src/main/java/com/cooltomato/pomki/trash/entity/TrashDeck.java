package com.cooltomato.pomki.trash.entity;

import com.cooltomato.pomki.deck.entity.Deck;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TRASH_DECK")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrashDeck {
    
    @EmbeddedId
    private TrashDeckId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trash_id", insertable = false, updatable = false)
    private Trash trash;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", insertable = false, updatable = false)
    private Deck deck;
    
    // 편의 메서드
    public String getDeckId() {
        return id != null ? id.getDeckId() : null;
    }
    
    public String getTrashId() {
        return id != null ? id.getTrashId() : null;
    }
} 