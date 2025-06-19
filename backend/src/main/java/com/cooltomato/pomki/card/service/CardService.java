package com.cooltomato.pomki.card.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

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
    public CardResponseDto createCardService(String deckId, CardRequestDto request) {
        log.info("debug >>> CardService createCardService 카드 한 장 생성");
        
        Deck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new IllegalArgumentException("덱을 찾을 수 없습니다."));
            
        Card entity = Card.builder()
                                    .deck(deck)
                                    .content(request.getContent())
                                    .answer(request.getAnswer())
                                    .isDeleted(false)
                                    .build();
        cardRepository.save(entity);
        log.info("debug >>> CardService createCardService 카드 생성 성공");
        return CardResponseDto.builder()
                                .cardId(entity.getCardId())
                                .content(entity.getContent())
                                .answer(entity.getAnswer())
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .isDeleted(entity.getIsDeleted())
                            .build();
    }

    /*
     // 모든 카드 조회
    public void readAllcardsService(Long memberId) {
        deckRepository.findByMemberIdAndIsDeletedFalse(memberId);
    }
     */
    

    // 카드 한 장 조회
    @Transactional(readOnly = true)
    public CardResponseDto readAcardService(Long cardId) {
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
                                .build() ;
            }
            // return CardResponseDto.builder()
            //         .cardId(aCard.getCardId())
            //         .content(aCard.getContent())
            //         .answer(aCard.getAnswer())
            //         .createdAt(aCard.getCreatedAt())
            //         .updatedAt(aCard.getUpdatedAt())
            //         .build();}
        else{
            throw new IllegalArgumentException("카드를 찾을 수 없습니다.") ;
        }
    }

    

    public CardResponseDto updateAcardService(Long cardId, CardRequestDto request) {
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

    public CardResponseDto deleteAcardService(Long cardId) {
        log.info("debug >>> CardService deleteAcardService 카드 한 장 삭제");
        Optional<Card> aCardOp = cardRepository.findByCardIdAndIsDeletedFalse(cardId) ;

        if (aCardOp.isPresent()) {
            log.info("debug >>> CardService deleteAcardService 해당 카드 존재, 삭제 시작");
            aCardOp.get().setIsDeleted(true);
            aCardOp.get().setUpdatedAt(LocalDateTime.now());
            cardRepository.save(aCardOp.get());
            log.info("debug >>> CardService deleteAcardService 카드 삭제 성공");

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