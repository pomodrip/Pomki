package com.cooltomato.pomki.deck.service;

import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.entity.DeckEntity;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeckService {
    
        @Autowired
        private DeckRepository deckRepository;
    
        @Transactional
        public DeckResponseDto createDeck(String deckName) {
            // 동일한 이름의 덱 존재할 때 예외처리
            System.out.println("debug >>> DeckService createDeck");
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
        public List<DeckEntity> searchAllDecks(Long memberId) {
            System.out.println("debug >>> DeckService searchAllDecks");
            List<DeckEntity> decksLst = deckRepository.findAllDecksByMemberId(memberId);
            if (decksLst.size() != 0) {
                System.out.println("debug >>> 멤버별 덱 전체 조회 성공");
            }
            return decksLst;
        }


        public void searchAllCardsInAdeck(String deckId) {
            System.out.println("debug >>> DeckService searchAllCardsInAdeck");
        }
        
    }
