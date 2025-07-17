package com.cooltomato.pomki.trash.entity;

import com.cooltomato.pomki.card.entity.Card;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "TRASH_CARD")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrashCard {
    
    @EmbeddedId
    private TrashCardId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trash_id", insertable = false, updatable = false)
    private Trash trash;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", insertable = false, updatable = false)
    private Card card;
    
    // 편의 메서드
    public Long getCardId() {
        return id != null ? id.getCardId() : null;
    }
    
    public String getTrashId() {
        return id != null ? id.getTrashId() : null;
    }
} 