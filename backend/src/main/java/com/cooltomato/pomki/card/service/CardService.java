package com.cooltomato.pomki.card.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.entity.CardBookmark;
import com.cooltomato.pomki.bookmark.repository.BookmarkRepository;
import com.cooltomato.pomki.bookmark.repository.CardBookmarkRepository;
import com.cooltomato.pomki.card.dto.CardRequestDto;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.cardtag.entity.CardTag;
import com.cooltomato.pomki.cardtag.entity.CardTagId;
import com.cooltomato.pomki.cardtag.repository.CardTagRepository;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.cooltomato.pomki.notetag.repository.NoteTagRepository;
import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardService {
    
    private final CardRepository cardRepository;
    private final DeckRepository deckRepository;
    private final CardTagRepository cardTagRepository;
    private final NoteTagRepository noteTagRepository;
    private final TagRepository tagRepository;
    private final BookmarkRepository bookmarkRepository;
    private final CardBookmarkRepository cardBookmarkRepository;
    
    @Transactional
    public CardResponseDto createOneCardService(PrincipalMember principal, String deckId, CardRequestDto request) {
        log.info("debug >>> CardService createCardService 카드 한 장 생성");
        Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
            
        Card entity = Card.builder()
                                    .deck(deck.get())
                                    .content(request.getContent())
                                    .answer(request.getAnswer())
                                    .isDeleted(false)
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
                                .deckId(entity.getDeck().getDeckId())
                                .deckName(entity.getDeck().getDeckName())
                                .tags(entity.getCardTags().stream()
                                        .map(CardTag::getTagName)
                                        .collect(Collectors.toList()))
                                .isDeleted(entity.getIsDeleted())
                            .build();
    }

    

    // 카드 한 장 조회
    @Transactional(readOnly = true)
    public CardResponseDto readOnecardService(PrincipalMember principal, Long cardId) {
        log.info("debug >>> CardService readAllCardsService");
        Optional<Card> aCardOp = cardRepository.findByCardIdAndIsDeletedFalse(cardId);
        boolean isBookmarked = cardBookmarkRepository.existsByMemberMemberIdAndCardCardId(principal.getMemberId(), cardId);
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
                                .deckId(aCard.getDeck().getDeckId())
                                .deckName(aCard.getDeck().getDeckName())
                                .tags(aCard.getCardTags().stream()
                                        .map(CardTag::getTagName)
                                        .collect(Collectors.toList()))
                                .isBookmarked(isBookmarked)
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
        boolean isBookmarked = cardBookmarkRepository.existsByCardCardId(cardId);
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
                                    .deckId(aCardOp.get().getDeck().getDeckId())
                                    .deckName(aCardOp.get().getDeck().getDeckName())
                                    .tags(aCardOp.get().getCardTags().stream()
                                        .map(CardTag::getTagName)
                                        .collect(Collectors.toList()))
                                    .isBookmarked(isBookmarked)
                                    .build() ;
            
        }
        else {
        throw new IllegalArgumentException("카드를 찾을 수 없습니다.") ;
        // 그리고 return null;은 필요 없습니다.
        }
    }

    @Transactional
    public CardResponseDto deleteOneCardService(PrincipalMember principal, Long cardId) {
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

            cardBookmarkRepository.deleteByCardCardIdAndMemberMemberId(cardId, principal.getMemberId());
            log.info("debug >>> CardService deleteOneCardService 카드 북마크 삭제 성공");
            

            // 카드 태그 삭제 전에 태그 이름들을 먼저 저장
            List<CardTag> cardTags = cardTagRepository.findByCard_CardId(aCardOp.get().getCardId());
            List<String> cardTagNames = cardTags.stream()
                    .map(CardTag::getTagName)
                    .collect(Collectors.toList());
            
            // 카드 태그는 엔터티 관계상 자동으로 삭제되므로 별도 삭제 불필요
            cardTagRepository.deleteAll(cardTags);

            // 다른 카드에서 해당 태그를 사용하지 않고 노트에 대해서도 해당 태그가 없다면 태그 테이블에서 삭제
            for(String tagName : cardTagNames) {
                // 다른 카드에서 해당 태그 사용 여부 확인
                long remainingCardTagCount = cardTagRepository.countByTagNameAndMemberId(tagName, principal.getMemberId());
                
                // 노트에서 해당 태그 사용 여부 확인
                long noteTagCount = noteTagRepository.countByTagNameAndMemberId(tagName, principal.getMemberId());
                
                // 카드와 노트 모두에서 해당 태그를 사용하지 않으면 태그 테이블에서 삭제
                if(remainingCardTagCount == 0 && noteTagCount == 0) {
                    Optional<Tag> tag = tagRepository.findByMemberIdAndTagName(principal.getMemberId(), tagName);
                    tag.ifPresent(tagRepository::delete);
                    log.info("debug >>> CardService deleteOneCardService 태그 삭제 완료: " + tagName);
                }
            }

            return CardResponseDto.builder()
                                    .cardId(aCardOp.get().getCardId())
                                    .content(aCardOp.get().getContent())
                                    .answer(aCardOp.get().getAnswer())
                                    .createdAt(aCardOp.get().getCreatedAt())
                                    .updatedAt(aCardOp.get().getUpdatedAt())
                                    .isDeleted(aCardOp.get().getIsDeleted())
                                    .deckId(aCardOp.get().getDeck().getDeckId())
                                    .deckName(aCardOp.get().getDeck().getDeckName())
                                    .build() ;

        }
        else {
        throw new IllegalArgumentException("카드를 찾을 수 없어 삭제에 실패하였습니다.") ;
        }
        
    }

    @Transactional(readOnly = true)
    public List<CardResponseDto> searchCardsByKeywordService(PrincipalMember principal, String keyword) {
        List<Card> cards = cardRepository.findByDeck_MemberIdAndIsDeletedFalseAndContentContainingIgnoreCaseOrDeck_MemberIdAndIsDeletedFalseAndAnswerContainingIgnoreCase(
            principal.getMemberId(), keyword, principal.getMemberId(), keyword);

        // List<CardBookmark> bookmarkedCards = cardBookmarkRepository
        
        if (cards.isEmpty()) {
            log.info("debug >>> 검색어에 해당하는 검색 결과가 없습니다.");
        }

        return cards.stream().map(card -> CardResponseDto.builder()
                .cardId(card.getCardId())
                .content(card.getContent())
                .answer(card.getAnswer())
                .deckId(card.getDeck().getDeckId())
                .deckName(card.getDeck().getDeckName())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .isDeleted(card.getIsDeleted())
                .isBookmarked(cardBookmarkRepository.existsByMemberMemberIdAndCardCardId(principal.getMemberId(), card.getCardId()))
                .build()
        ).toList();
    }
} 