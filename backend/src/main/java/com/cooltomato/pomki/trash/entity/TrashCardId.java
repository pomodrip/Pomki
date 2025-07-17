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
public class TrashCardId implements Serializable {
    
    @Column(name = "card_id", nullable = false)
    private Long cardId;
    
    @Column(name = "trash_id", length = 50, nullable = false)
    private String trashId;
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TrashCardId that = (TrashCardId) o;
        return Objects.equals(cardId, that.cardId) &&
               Objects.equals(trashId, that.trashId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(cardId, trashId);
    }
} 