package com.cooltomato.pomki.bookmark.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.dto.BookmarkRequestDto;
import com.cooltomato.pomki.bookmark.dto.BookmarkResponseDto;
import com.cooltomato.pomki.bookmark.entity.BookmarkCard;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import com.cooltomato.pomki.bookmark.repository.BookmarkCardRepository;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    private final CardRepository cardRepository;
    private final MemberRepository memberRepository;
    private final BookmarkCardRepository bookmarkCardRepository;

    @Transactional
    public BookmarkResponseDto createBookmarkService(PrincipalMember principal, BookmarkRequestDto requestDto) {
        // memberId, cardId 추출
        Long memberId = principal.getMemberId();
        Long cardId = requestDto.getCardId();

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalArgumentException("Card not found"));

        BookmarkCard bookmarkCard = BookmarkCard.builder()
                .member(member)
                .card(card)
                .build();
        bookmarkCardRepository.save(bookmarkCard);

        return BookmarkResponseDto.builder()
                .cardId(cardId)
                .memberId(memberId)
                .build();
    }
} 