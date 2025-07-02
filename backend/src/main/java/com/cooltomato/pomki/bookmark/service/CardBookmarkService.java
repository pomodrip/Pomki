package com.cooltomato.pomki.bookmark.service;

import com.cooltomato.pomki.bookmark.dto.CardBookmarkDto;
import com.cooltomato.pomki.bookmark.entity.CardBookmark;
import com.cooltomato.pomki.bookmark.repository.CardBookmarkRepository;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.global.exception.AlreadyBookmarkedException;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CardBookmarkService {

    private final CardBookmarkRepository cardBookmarkRepository;
    private final MemberRepository memberRepository;
    private final CardRepository cardRepository;

    @Transactional
    public void addCardBookmark(Long memberId, Long cardId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Member not found"));
        
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("Card not found"));

        // 이미 북마크가 존재하는지 확인
        if (cardBookmarkRepository.existsByMemberMemberIdAndCardCardId(memberId, cardId)) {
            throw new AlreadyBookmarkedException("이미 북마크된 카드입니다.");
        }

        CardBookmark cardBookmark = CardBookmark.builder()
                .member(member)
                .card(card)
                .build();

        cardBookmarkRepository.save(cardBookmark);
    }

    @Transactional
    public void removeCardBookmark(Long memberId, Long cardId) {
        cardBookmarkRepository.deleteByMemberMemberIdAndCardCardId(memberId, cardId);
    }

    public List<CardBookmarkDto> getCardBookmarks(Long memberId) {
        List<CardBookmark> cardBookmarks = cardBookmarkRepository.findByMemberMemberId(memberId);
        
        return cardBookmarks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public boolean isCardBookmarked(Long memberId, Long cardId) {
        return cardBookmarkRepository.existsByMemberMemberIdAndCardCardId(memberId, cardId);
    }

    private CardBookmarkDto convertToDto(CardBookmark cardBookmark) {
        Card card = cardBookmark.getCard();
        
        return CardBookmarkDto.builder()
                .cardId(card.getCardId())
                .cardContent(card.getContent())
                .cardAnswer(card.getAnswer())
                .deckName(card.getDeck().getDeckName())
                .createdAt(cardBookmark.getCreatedAt())
                .build();
    }
} 