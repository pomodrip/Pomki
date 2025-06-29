package com.cooltomato.pomki.cardtag.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.cardtag.dto.CardTagRequestDto;
import com.cooltomato.pomki.cardtag.dto.CardTagResponseDto;
import com.cooltomato.pomki.cardtag.entity.CardTag;
import com.cooltomato.pomki.cardtag.entity.CardTagId;
import com.cooltomato.pomki.cardtag.repository.CardTagRepository;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.entity.TagId;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Builder
@Service
@RequiredArgsConstructor
@Slf4j
public class CardTagService {
    private final CardTagRepository cardTagRepository;
    private final TagRepository tagRepository;
    private final CardRepository cardRepository;

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

    public CardTagResponseDto createCardTagService(PrincipalMember principal, CardTagRequestDto request) {
        log.info("debug >>> 카드에 태그 추가 시작");
        Card card = cardRepository.findById(request.getCardId())
                .orElseThrow(() -> new RuntimeException("Card not found with id: " + request.getCardId()));
        if (!card.getDeck().getMemberId().equals(principal.getMemberId())) {
            throw new RuntimeException("Card does not belong to the current member");
        }
        CardTag entity = CardTag.builder()
                .cardId(request.getCardId())
                .memberId(principal.getMemberId())
                .tagName(request.getTagName())
                .card(card)
                .build();
        if (!cardTagRepository.findById(CardTagId.builder()
                .cardId(request.getCardId())
                .memberId(principal.getMemberId())
                .tagName(request.getTagName())
                .build()).isPresent()) {
            cardTagRepository.save(entity);
            log.info("debug >>> 카드에 태그 추가 완료");
        }
        if (!tagRepository.findById(TagId.builder()
                .tagName(request.getTagName())
                .memberId(principal.getMemberId())
                .build()).isPresent()) {
            tagRepository.save(Tag.builder()
                    .tagName(request.getTagName())
                    .memberId(principal.getMemberId())
                    .build());
            log.info("debug >>> Tag에 추가 완료");
        }
        return CardTagResponseDto.builder()
                .cardId(request.getCardId())
                .memberId(principal.getMemberId())
                .tagName(request.getTagName())
                .build();
    }

    public void deleteCardTagService(PrincipalMember principal, CardTagRequestDto request) {
        CardTagId cardTagIdEntity = CardTagId.builder()
                .cardId(request.getCardId())
                .memberId(principal.getMemberId())
                .tagName(request.getTagName())
                .build();
        cardTagRepository.deleteById(cardTagIdEntity);
        Long remainingCardTagCount = cardTagRepository.countByTagNameAndMemberId(
                request.getTagName(), principal.getMemberId());
        if (remainingCardTagCount == 0) {
            TagId tagIdEntity = TagId.builder()
                    .tagName(request.getTagName())
                    .memberId(principal.getMemberId())
                    .build();
            tagRepository.deleteById(tagIdEntity);
            log.info("debug >>> Tag에서 삭제 완료");
        }
    }

    public List<CardResponseDto> readCardByTagNameService(PrincipalMember principal, String tagName) {
        List<CardTag> allSameTagName = cardTagRepository.findAllCardIdByMemberIdAndTagName(principal.getMemberId(), tagName);
        List<Card> cardsWithTagName = cardRepository.findAllById(allSameTagName.stream()
                .map(CardTag::getCardId)
                .collect(Collectors.toList()));
        return cardsWithTagName.stream()
                .map(CardResponseDto::from)
                .collect(Collectors.toList());
    }
}
