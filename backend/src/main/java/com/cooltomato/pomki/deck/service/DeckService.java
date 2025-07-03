package com.cooltomato.pomki.deck.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.entity.CardBookmark;
import com.cooltomato.pomki.bookmark.repository.BookmarkRepository;
import com.cooltomato.pomki.bookmark.repository.CardBookmarkRepository;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.deck.dto.DeckRequestDto;
import com.cooltomato.pomki.deck.dto.DeckResponseDto;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.notetag.repository.NoteTagRepository;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.repository.TagRepository;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.cardtag.entity.CardTag;
import com.cooltomato.pomki.cardtag.repository.CardTagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeckService {

        private final DeckRepository deckRepository;
        private final CardRepository cardRepository;
        private final CardTagRepository cardTagRepository;
        private final TagRepository tagRepository;
        private final NoteTagRepository noteTagRepository;
        private final BookmarkRepository bookmarkRepository;
        private final CardBookmarkRepository cardBookmarkRepository;
    
        @Transactional
        public DeckResponseDto createOneDeckService(Long memberId, DeckRequestDto request) {
            // 동일한 이름의 덱 존재할 때 예외처리
            log.info("debug >>> DeckService createDeck");
            if (deckRepository.existsByMemberIdAndDeckNameAndIsDeletedFalse(memberId, request.getDeckName())) {
                throw new IllegalArgumentException("동일한 이름의 덱이 존재합니다.");
            }
    
            // 덱 생성
            Deck deck = Deck.builder()
                                        .memberId(memberId)
                                        .deckName(request.getDeckName())
                                        .isDeleted(false)
                                        .cardCnt(0L)
                                        .updatedAt(LocalDateTime.now())
                                        .createdAt(LocalDateTime.now())
                                        .build();
            
            Deck entity = deckRepository.save(deck);
    
            return DeckResponseDto.builder()
                    .deckId(entity.getDeckId())
                    .deckName(entity.getDeckName())
                    .createdAt(entity.getCreatedAt())
                    .updatedAt(entity.getUpdatedAt())
                    .cardCnt(entity.getCardCnt())
                    .build();
        }

        
        // 덱 전체조회
        public List<DeckResponseDto> readAllDecksService(@AuthenticationPrincipal PrincipalMember principal) {
            log.info("debug >>> DeckService searchAllDecks");
            List<Deck> decks = deckRepository.findAllDecksByMemberIdAndIsDeletedFalse(principal.getMemberId());

            if (decks.isEmpty()) {
                log.info("debug >>> 멤버의 덱이 존재하지 않습니다.");
            }

            log.info("debug >>> 멤버별 덱 전체 조회 성공");

            // 삭제되지 않은 덱만 조회
            return decks.stream().map(deck -> DeckResponseDto.builder()
                    .deckId(deck.getDeckId())
                    .deckName(deck.getDeckName())
                    .createdAt(deck.getCreatedAt())
                    .updatedAt(deck.getUpdatedAt())
                    .cardCnt(deck.getCardCnt())
                    .isDeleted(deck.getIsDeleted())
                    .memberId(deck.getMemberId())
                    .build())
                    .toList();
        }

        // 덱 안 카드 전체 조회
        // 삭제되지 않은 덱에 소속된 삭제되지 않은 카드만 조회되어야 함
        public List<CardResponseDto> readAllCardsService(PrincipalMember principal, String deckId) {
            log.info("debug >>> DeckService readAllCards");
            // 덱 생존/삭제 여부 조회
            Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
            if (deck.get().getIsDeleted()) {
                throw new IllegalArgumentException("삭제된 덱입니다.");
            }

            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deck.get().getDeckId());

            if (cards.isEmpty()) {
                log.info("debug >>> 카드가 존재하지 않습니다.");
            }
            log.info("debug >>> 덱 안 카드 전체 조회 성공");
            
            List<CardResponseDto> result = new ArrayList<>();
            for (Card card : cards) {
                List<CardTag> cardTags = cardTagRepository.findByCard_CardId(card.getCardId());
                List<String> tags = cardTags.stream()
                        .map(CardTag::getTagName)
                        .collect(Collectors.toList());
                boolean isBookmarked = cardBookmarkRepository.existsByMemberMemberIdAndCardCardId(principal.getMemberId(), card.getCardId());

                CardResponseDto dto = CardResponseDto.builder()
                        .cardId(card.getCardId())
                        .deckId(card.getDeck().getDeckId())
                        .deckName(card.getDeck().getDeckName())
                        .content(card.getContent())
                        .answer(card.getAnswer())
                        .createdAt(card.getCreatedAt())
                        .updatedAt(card.getUpdatedAt())
                        .tags(tags)
                        .isBookmarked(isBookmarked)
                        .build();
                result.add(dto);
            }
            return result;
            
        }

        @Transactional
        public DeckResponseDto updateOneDeckSerivce(PrincipalMember principal, String deckId, DeckRequestDto request) {
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
        public void deleteOneDeckService(PrincipalMember principal, String deckId) {
            log.info("debug >>> DeckService deleteDeck");
            Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
 
            deck.get().setIsDeleted(true);
            deckRepository.save(deck.get());
            log.info("debug >>> 덱 삭제 성공, deckId:" + deckId);
            log.info("debug >>> 덱에 소속된 카드 전체 삭제");

            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);
            if (!cards.isEmpty()) {
                cards.forEach(card -> card.setIsDeleted(true));
                cardRepository.saveAll(cards);
                cardBookmarkRepository.deleteAllByCardCardIdIn(cards.stream().map(Card::getCardId).collect(Collectors.toList()));
                log.info("debug >>> 덱 안 카드 삭제 성공");
            }

            // 덱의 모든 카드에서 사용된 태그들을 수집
            List<String> usedTagNames = new ArrayList<>();
            for(Card card : cards) {
                List<String> cardTagNames = cardTagRepository.findTagNameByCardId(card.getCardId(), principal.getMemberId());
                usedTagNames.addAll(cardTagNames);
                // 카드태그 삭제
                List<CardTag> cardTags = cardTagRepository.findByCard_CardId(card.getCardId());
                cardTagRepository.deleteAll(cardTags);
            }

            // 노트에서 사용 중인 태그들 확인
            List<NoteTag> noteTags = noteTagRepository.findByMemberId(principal.getMemberId());
            List<String> noteTagNames = noteTags.stream()
                    .map(NoteTag::getTagName)
                    .collect(Collectors.toList());

            // 카드에서 사용되지 않고 노트에서도 사용되지 않는 태그들을 삭제
            for(String tagName : usedTagNames) {
                if (!noteTagNames.contains(tagName)) {
                    Optional<Tag> tag = tagRepository.findByMemberIdAndTagName(principal.getMemberId(), tagName);
                    tag.ifPresent(tagRepository::delete);
                }
            }

            log.info("debug >>> 덱 안 카드 태그 삭제 성공");

            // 북마크에서 삭제된 카드들에 대한 데이터들 삭제

        }

        // 덱에서 검색어를 입력하면 덱 안에 있는 검색어가 있는 카드들이 표시됨
        public List<CardResponseDto> searchCardsInDeckService(PrincipalMember principal, String query, String deckId) {
            log.info("debug >>> DeckService searchCardsInDeck");

            Optional<Deck> deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(principal.getMemberId(), deckId) ;
            if (deck.get().getIsDeleted()) {
                throw new IllegalArgumentException("삭제된 덱입니다.");
            }

            List<Card> cards = cardRepository.findByDeckDeckIdAndIsDeletedFalse(deckId);

            List<Card> filteredCards = cards.stream()
                .filter(card -> (card.getContent() != null && card.getContent().contains(query)) ||
                                (card.getAnswer() != null && card.getAnswer().contains(query)))
                .toList();

            if (filteredCards.isEmpty()) {
                log.info("debug >>> 검색어에 해당하는 카드가 존재하지 않습니다.");
            }

            List<CardResponseDto> result = new ArrayList<>();
            for (Card card : filteredCards) {
                boolean isBookmarked = cardBookmarkRepository.existsByMemberMemberIdAndCardCardId(principal.getMemberId(), card.getCardId());
                List<CardTag> cardTags = cardTagRepository.findByCard_CardId(card.getCardId());
                List<String> tags = cardTags.stream()
                        .map(CardTag::getTagName)
                        .collect(Collectors.toList());
            
            CardResponseDto dto = CardResponseDto.builder()
                        .cardId(card.getCardId())
                        .content(card.getContent())
                        .answer(card.getAnswer())
                        .createdAt(card.getCreatedAt())
                        .updatedAt(card.getUpdatedAt())
                        .deckId(card.getDeck().getDeckId())
                        .deckName(card.getDeck().getDeckName())
                        .tags(tags)
                        .isBookmarked(isBookmarked)
                        .build();
                result.add(dto);
            }
            return result;

        }

        // 덱 이름 수정
        
        
    }
