package com.cooltomato.pomki.deck.service;

import com.cooltomato.pomki.card.entity.CardEntity;
import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.entity.DeckEntity;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeckService {

        private final DeckRepository deckRepository;
    
        @Transactional
        public DeckResponseDto createDeck(String deckName) {
            // 동일한 이름의 덱 존재할 때 예외처리
            log.info("debug >>> DeckService createDeck");
            if (deckRepository.existsByMemberIdAndDeckNameAndIsDeletedFalse(777L, deckName)) {
                throw new IllegalArgumentException("동일한 이름의 덱이 존재합니다.");
            }
    
            // 덱 생성
            DeckEntity deck = DeckEntity.builder()
                                        .memberId(777L)
                                        .deckName(deckName)
                                        .createdAt(LocalDateTime.now())
                                        .updatedAt(LocalDateTime.now())
                                        .isDeleted(false)
                                        .cardCnt(0L)
                                        .build();
            
            DeckEntity savedDeck = deckRepository.save(deck);
    
            return DeckResponseDto.builder()
                    .deckId(savedDeck.getDeckId())
                    .deckName(savedDeck.getDeckName())
                    .createdAt(savedDeck.getCreatedAt())
                    .cardCnt(savedDeck.getCardCnt())
                    .build();
        }

        
        // 덱 전체조회
        public List<DeckResponseDto> readAllDecks(Long memberId) {
            log.info("debug >>> DeckService searchAllDecks");
            List<DeckEntity> decks = deckRepository.findAllDecksByMemberId(memberId);
            
            if (decks.isEmpty()) {
                log.info("debug >>> 멤버의 덱이 존재하지 않습니다.");
                return List.of();
            }
            
            log.info("debug >>> 멤버별 덱 전체 조회 성공");
            return decks.stream()
                    .map(deck -> DeckResponseDto.builder()
                            .deckId(deck.getDeckId())
                            .deckName(deck.getDeckName())
                            .createdAt(deck.getCreatedAt())
                            .cardCnt(deck.getCardCnt())
                            .build())
                    .toList();
        }


        public List<CardEntity> readAllCards(String deckId) {
            log.info("debug >>> DeckService readAllCards");
            List<CardEntity> cardsLst = deckRepository.findAllCardsByDeckId(deckId);
            if (cardsLst.size() != 0) {
                log.info("debug >>> 덱 안 카드 전체 조회 성공");
            }
            return cardsLst;    // responseDto로 형 변환할 것.
        }
        
    }
