package com.cooltomato.pomki.card.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {
    
    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    
    @Transactional
    public Card createCardService(CardRequestDto request) {
        log.info("debug >>> CardService createCardService");
        
        Deck deck = deckRepository.findById(request.getDeckId())
            .orElseThrow(() -> new IllegalArgumentException("덱을 찾을 수 없습니다."));
            
        Card entity = Card.builder()
                                    .deck(deck)
                                    .content(request.getContent())
                                    .answer(request.getAnswer())
                                    .isDeleted(false)
                                    .build();

        return cardRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<Card> readAllCardsService(String deckId) {
        log.info("debug >>> CardService readAllCardsService");
        return cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);
    }
} 