package com.cooltomato.pomki.deck.service;

import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.cooltomato.pomki.card.repository.CardRepository;
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
        private final CardRepository cardRepository;
    
        @Transactional
        public DeckResponseDto createDeck(DeckRequestDto request) {
            // 동일한 이름의 덱 존재할 때 예외처리
            log.info("debug >>> DeckService createDeck");
            if (deckRepository.existsByMemberIdAndDeckNameAndIsDeletedFalse(777L, request.getDeckName())) {
                throw new IllegalArgumentException("동일한 이름의 덱이 존재합니다.");
            }
    
            // 덱 생성
            Deck deck = Deck.builder()
                                        .memberId(777L)
                                        .deckName(request.getDeckName())
                                        .createdAt(LocalDateTime.now())
                                        .updatedAt(LocalDateTime.now())
                                        .isDeleted(false)
                                        .cardCnt(0L)
                                        .build();
            
            Deck entity = deckRepository.save(deck);
    
            return DeckResponseDto.builder()
                    .deckId(entity.getDeckId())
                    .deckName(entity.getDeckName())
                    .createdAt(entity.getCreatedAt())
                    .cardCnt(entity.getCardCnt())
                    .build();
        }

        
        // 덱 전체조회
        public List<DeckResponseDto> readAllDecks(Long memberId) {
            log.info("debug >>> DeckService searchAllDecks");
            List<Deck> decks = deckRepository.findAllDecksByMemberId(memberId);
            
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

        // 덱 안 카드 전체 조회
        public List<CardResponseDto> readAllCards(String deckId) {
            log.info("debug >>> DeckService readAllCards");
            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);
            if (cards.isEmpty()) {
                log.info("debug >>> 덱 안에 카드가 존재하지 않습니다.");
                return List.of();
            }
            log.info("debug >>> 덱 안 카드 전체 조회 성공");
            
            return cards.stream().map(card -> CardResponseDto.builder()
                    .cardId(card.getCardId())
                    .content(card.getContent())
                    .answer(card.getAnswer())
                    .createdAt(card.getCreatedAt())
                    .updatedAt(card.getUpdatedAt())
                    .build()).toList();
        }


        public DeckResponseDto updateDeck(String deckId, DeckRequestDto request) {
            log.info("debug >>> DeckService updateDeck");
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new IllegalArgumentException("덱을 찾을 수 없습니다."));
            deck.setDeckName(request.getDeckName());
            deck.setUpdatedAt(LocalDateTime.now());
            Deck entity = deckRepository.save(deck);
            return DeckResponseDto.builder()
                    .deckId(entity.getDeckId())
                    .deckName(entity.getDeckName())
                    .createdAt(entity.getCreatedAt())
                    .cardCnt(entity.getCardCnt())
                    .build();
        }


        public void deleteDeck(String deckId) {
            log.info("debug >>> DeckService deleteDeck");
            Deck deck = deckRepository.findById(deckId)
                    .orElseThrow(() -> new IllegalArgumentException("덱을 찾을 수 없습니다."));
            // 덱이 존재할 경우 덱이 삭제됐음을 표시
            deck.setIsDeleted(true);
            deck.setUpdatedAt(LocalDateTime.now());
            deckRepository.save(deck);
            log.info("debug >>> 덱 삭제 성공, deckId:" + deckId);

            // 덱 안에 카드가 존재할 경우 카드도 삭제됐음을 표시
            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);
            if (!cards.isEmpty()) {
                cards.forEach(card -> card.setIsDeleted(true));
            }

            log.info("debug >>> 덱 안 카드 삭제 성공");

            
        }

        // 덱 이름 수정
        
        
    }
