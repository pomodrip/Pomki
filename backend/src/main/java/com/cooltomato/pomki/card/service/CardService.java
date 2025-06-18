package com.cooltomato.pomki.card.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.entity.CardEntity;
import com.cooltomato.pomki.card.repository.CardRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {
    
    private final CardRepository cardRepository;
    
    // 카드 생성
    public void createCardService(CardRequestDto request) {
        System.out.println("debug >>> CardService createCardService");
        CardEntity entity = CardEntity.builder()
                                        .deckId(request.getDeckId())
                                        .content(request.getContent())
                                        .answer(request.getAnswer())
                                        .isDeleted(false)
                                        .build();

        cardRepository.save(entity);
    }

    public void readAllCardsService(String deckId) {
       log.info("debug >>> CardService readAllCardsService");
    }

} 