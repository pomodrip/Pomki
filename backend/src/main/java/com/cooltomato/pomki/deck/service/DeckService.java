package com.cooltomato.pomki.deck.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeckService {

        private final DeckRepository deckRepository;
        private final CardRepository cardRepository;
    
        @Transactional
        public DeckResponseDto createDeck(Long memberId, DeckRequestDto request) {
            // 동일한 이름의 덱 존재할 때 예외처리
            log.info("debug >>> DeckService createDeck");
            if (deckRepository.existsByMemberIdAndDeckNameAndIsDeletedFalse(memberId, request.getDeckName())) {
                throw new IllegalArgumentException("동일한 이름의 덱이 존재합니다.");
            }
    
            // 덱 생성
            Deck deck = Deck.builder()
                                        .memberId(memberId)
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
        public List<DeckResponseDto> readAllDecks(@AuthenticationPrincipal PrincipalMember principal) {
            log.info("debug >>> DeckService searchAllDecks");
            List<Deck> decks = deckRepository.findAllDecksByMemberIdAndIsDeletedFalse(principal.getMemberId());

            if (decks.isEmpty()) {
                throw new IllegalArgumentException("멤버의 덱이 존재하지 않습니다.");
            }

            log.info("debug >>> 멤버별 덱 전체 조회 성공");

            // 삭제되지 않은 덱만 조회
            return decks.stream().map(deck -> DeckResponseDto.builder()
                    .deckId(deck.getDeckId())
                    .deckName(deck.getDeckName())
                    .createdAt(deck.getCreatedAt())
                    .cardCnt(deck.getCardCnt())
                    .build())
                    .toList();
        }

        // 덱 안 카드 전체 조회
        // 삭제되지 않은 덱에 소속된 삭제되지 않은 카드만 조회되어야 함
        public List<CardResponseDto> readAllCards(PrincipalMember principal, String deckId) {
            log.info("debug >>> DeckService readAllCards");
            // 덱 생존/삭제 여부 조회
            Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
            if (deck.get().getIsDeleted()) {
                throw new IllegalArgumentException("삭제된 덱입니다.");
            }

            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);

            if (cards.isEmpty()) {
                throw new IllegalArgumentException("덱 안에 카드가 존재하지 않습니다.");
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


        public DeckResponseDto updateDeck(PrincipalMember principal, String deckId, DeckRequestDto request) {
            log.info("debug >>> DeckService updateDeck");
            Deck deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId)
                    .orElseThrow(() -> new IllegalArgumentException("덱을 찾을 수 없습니다."));
            deck.setDeckName(request.getDeckName());
            deck.setUpdatedAt(LocalDateTime.now());
            Deck entity = deckRepository.save(deck);
            return DeckResponseDto.builder()
                    .deckId(entity.getDeckId())
                    .deckName(entity.getDeckName())
                    .createdAt(entity.getCreatedAt())
                    .cardCnt(entity.getCardCnt())
                    .isDeleted(entity.getIsDeleted())
                    .updatedAt(entity.getUpdatedAt())
                    .memberId(entity.getMemberId())
                    .build();
        }


        @Transactional
        public void deleteDeck(PrincipalMember principal, String deckId) {
            log.info("debug >>> DeckService deleteDeck");
            Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
 
            deck.get().setIsDeleted(true);
            deck.get().setUpdatedAt(LocalDateTime.now());
            deckRepository.save(deck.get());
            log.info("debug >>> 덱 삭제 성공, deckId:" + deckId);
            log.info("debug >>> 덱에 소속된 카드 전체 삭제");

            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);
            if (!cards.isEmpty()) {
                cards.forEach(card -> card.setIsDeleted(true));
                cardRepository.saveAll(cards);
            }

            log.info("debug >>> 덱 안 카드 삭제 성공");

            
        }

        // 덱 이름 수정
        
        
    }
