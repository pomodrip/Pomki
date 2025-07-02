package com.cooltomato.pomki.cardtag.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.cardtag.dto.CardTagRequestDto;
import com.cooltomato.pomki.cardtag.dto.CardTagResponseDto;
import com.cooltomato.pomki.cardtag.entity.CardTag;
import com.cooltomato.pomki.cardtag.entity.CardTagId;
import com.cooltomato.pomki.cardtag.repository.CardTagRepository;
import com.cooltomato.pomki.notetag.repository.NoteTagRepository;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.entity.TagId;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardTagService {
    private final CardTagRepository cardTagRepository;
    private final TagRepository tagRepository;
    private final CardRepository cardRepository;
    private final NoteTagRepository noteTagRepository;

    public List<CardTagResponseDto> readAllCardTagService(PrincipalMember principal) {
        List<CardTag> cardTagList = cardTagRepository.findByMemberId(principal.getMemberId());
        return cardTagList.stream()
                .map(cardTag -> CardTagResponseDto.builder()
                        .cardId(cardTag.getCardId())
                        .memberId(cardTag.getMemberId())
                        .tagName(cardTag.getTagName())
                        .build())
                .collect(Collectors.toList());
    }

    public List<CardTagResponseDto> createCardTagService(PrincipalMember principal, CardTagRequestDto request) {
        log.info("debug >>> 카드에 태그 추가 시작");
        Card card = cardRepository.findById(request.getCardId())
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + request.getCardId()));
        if (!card.getDeck().getMemberId().equals(principal.getMemberId())) {
            throw new RuntimeException("사용자의 카드가 아닙니다.");
        }

        if (card.getIsDeleted()) {
            throw new RuntimeException("삭제된 카드에는 태그를 추가할 수 없습니다.");
        }

        List<CardTagResponseDto> createdTags = new ArrayList<>();

        // 리스트로 입력한 태그 하나하나를 카드태그로 저장
        for (String tagName : request.getTagNames()) {
            CardTag entity = CardTag.builder()
                    .cardId(request.getCardId())
                    .memberId(principal.getMemberId())
                    .tagName(tagName)
                    .card(card)
                    .build();

            if (!cardTagRepository.findById(CardTagId.builder()
                    .cardId(request.getCardId())
                    .memberId(principal.getMemberId())
                    .tagName(tagName)
                    .build()).isPresent()) {
                cardTagRepository.save(entity);
                log.info("debug >>> 카드에 태그 추가 완료: " + tagName);
                
                createdTags.add(CardTagResponseDto.builder()
                        .cardId(request.getCardId())
                        .memberId(principal.getMemberId())
                        .tagName(tagName)
                        .build());
            }
            
            if (!tagRepository.findById(TagId.builder()
                    .tagName(tagName)
                    .memberId(principal.getMemberId())
                    .build()).isPresent()) {
                tagRepository.save(Tag.builder()
                        .tagName(tagName)
                        .memberId(principal.getMemberId())
                        .build());
                log.info("debug >>> Tag에 추가 완료: " + tagName);
            }
        }
        
        return createdTags;
    }

    public void deleteCardTagService(PrincipalMember principal, @RequestParam("cardId") Long cardId, @RequestParam("tagName") String tagName) {
        CardTagId cardTagIdEntity = CardTagId.builder()
                .cardId(cardId)
                .memberId(principal.getMemberId())
                .tagName(tagName)
                .build();
        cardTagRepository.deleteById(cardTagIdEntity);
        Long remainingCardTagCount = cardTagRepository.countByTagNameAndMemberId(
                tagName, principal.getMemberId());
        Long noteTagCount = noteTagRepository.countByTagNameAndMemberId(
                tagName, principal.getMemberId());
        if (remainingCardTagCount == 0 && noteTagCount == 0) {
            TagId tagIdEntity = TagId.builder()
                    .tagName(tagName)
                    .memberId(principal.getMemberId())
                    .build();
            tagRepository.deleteById(tagIdEntity);
            log.info("debug >>> Tag에서 삭제 완료");
        } else {
            log.info("debug >>> Tag는 유지 (다른 노트에서 {}개 사용 중)", remainingCardTagCount) ;
        }
    }

    public List<CardResponseDto> readCardByTagNameService(PrincipalMember principal, String tagName) {
        List<CardTag> allSameTagName = cardTagRepository.findAllCardIdByMemberIdAndTagName(principal.getMemberId(), tagName);
        List<Card> cardsWithTagName = cardRepository.findAllById(allSameTagName.stream()
                .map(CardTag::getCardId)
                .collect(Collectors.toList()));
        return cardsWithTagName.stream()
                .map(card -> CardResponseDto.builder()
                        .cardId(card.getCardId())
                        .deckId(card.getDeck().getDeckId())
                        .deckName(card.getDeck().getDeckName())
                        .content(card.getContent())
                        .answer(card.getAnswer())
                        .createdAt(card.getCreatedAt())
                        .updatedAt(card.getUpdatedAt())
                        .tags(card.getCardTags().stream()
                                .map(CardTag::getTagName)
                                .distinct()
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }
}
