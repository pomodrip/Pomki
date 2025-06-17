package com.cooltomato.pomki.card.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.GenericGenerator;

import com.cooltomato.pomki.deck.entity.DeckEntity;

@Builder
@Entity
@Table(name = "CARD")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardEntity {
    
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "card_id", length = 50)
    private String cardId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private DeckEntity deck;
} 