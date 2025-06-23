package com.cooltomato.pomki.card.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {
    
    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    
    @Transactional
    public CardResponseDto createOneCardService(PrincipalMember principal, String deckId, CardRequestDto request) {
        log.info("debug >>> CardService createCardService 카드 한 장 생성");
        Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
            
        Card entity = Card.builder()
                                    .deck(deck.get())
                                    .content(request.getContent())
                                    .answer(request.getAnswer())
                                    .isDeleted(false)
                                    .createdAt(LocalDateTime.now())
                                    .build();
        cardRepository.save(entity);
        log.info("debug >>> CardService createCardService 카드 생성 성공");

        deck.get().setCardCnt(deck.get().getCardCnt() + 1);
        deck.get().setUpdatedAt(LocalDateTime.now());
        

        deckRepository.save(deck.get());
        log.info("debug >>> CardService createCardService 덱별 카드 카운트 업데이트 성공");

        return CardResponseDto.builder()
                                .cardId(entity.getCardId())
                                .content(entity.getContent())
                                .answer(entity.getAnswer())
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .isDeleted(entity.getIsDeleted())
                            .build();
    }

    

    // 카드 한 장 조회
    @Transactional(readOnly = true)
    public CardResponseDto readOnecardService(Long cardId) {
        log.info("debug >>> CardService readAllCardsService");
        Optional<Card> aCardOp = cardRepository.findByCardIdAndIsDeletedFalse(cardId);
        if (aCardOp.isPresent()) {
            log.info("debug >>> CardService readAcardService 해당 카드 존재");
            Card aCard = aCardOp.get();
            return CardResponseDto.builder()
                                .cardId(aCard.getCardId())
                                .content(aCard.getContent())
                                .answer(aCard.getAnswer())  
                                .createdAt(aCard.getCreatedAt())
                                .updatedAt(aCard.getUpdatedAt())
                                .isDeleted(aCard.getIsDeleted())
                                .build() ;
            }
            
        else{
            throw new IllegalArgumentException("카드를 찾을 수 없습니다.") ;
        }
    }

    
    // 카드 한 장 수정
    @Transactional
    public CardResponseDto updateOneCardService(Long cardId, CardRequestDto request) {
        log.info("debug >>> CardService updateAcardService 카드 한 장 내용 수정");
        log.info("debug >>> cardId: " + cardId);
        Optional<Card> aCardOp = cardRepository.findByCardIdAndIsDeletedFalse(cardId) ;
        if (aCardOp.isPresent()) {
            log.info("debug >>> CardService updateAcardService 해당 카드 존재, 수정 시작");
            aCardOp.get().setContent(request.getContent());
            aCardOp.get().setAnswer(request.getAnswer());
            aCardOp.get().setUpdatedAt(LocalDateTime.now());
            cardRepository.save(aCardOp.get());
            log.info("debug >>> CardService updateAcardService 카드 수정 성공");

            return CardResponseDto.builder()
                                    .cardId(aCardOp.get().getCardId())
                                    .content(aCardOp.get().getContent())
                                    .answer(aCardOp.get().getAnswer())
                                    .createdAt(aCardOp.get().getCreatedAt())
                                    .updatedAt(aCardOp.get().getUpdatedAt())
                                    .isDeleted(aCardOp.get().getIsDeleted())
                                    .build() ;
            
        }
        else {
        throw new IllegalArgumentException("카드를 찾을 수 없습니다.") ;
        // 그리고 return null;은 필요 없습니다.
        }
    }

    @Transactional
    public CardResponseDto deleteOnecardService(PrincipalMember principal, Long cardId) {
        log.info("debug >>> CardService deleteAcardService 카드 한 장 삭제");
        Optional<Card> aCardOp = cardRepository.findByCardIdAndIsDeletedFalse(cardId) ;

        if (aCardOp.isPresent()) {
            log.info("debug >>> CardService deleteAcardService 해당 카드 존재, 삭제 시작");
            aCardOp.get().setIsDeleted(true);
            aCardOp.get().setUpdatedAt(LocalDateTime.now());
            cardRepository.save(aCardOp.get());
            log.info("debug >>> CardService deleteAcardService 카드 삭제 성공");

            // 덱 카드 개수 감소
            deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), aCardOp.get().getDeck().getDeckId())
                .ifPresent(deck -> {
                    deck.setCardCnt(deck.getCardCnt() - 1);
                    deck.setUpdatedAt(LocalDateTime.now());
                    deckRepository.save(deck);
            });

            return CardResponseDto.builder()
                                    .cardId(aCardOp.get().getCardId())
                                    .content(aCardOp.get().getContent())
                                    .answer(aCardOp.get().getAnswer())
                                    .createdAt(aCardOp.get().getCreatedAt())
                                    .updatedAt(aCardOp.get().getUpdatedAt())
                                    .isDeleted(aCardOp.get().getIsDeleted())
                                    .build() ;

        }
        else {
        throw new IllegalArgumentException("카드를 찾을 수 없어 삭제에 실패하였습니다.") ;
        }
        
    }
} 