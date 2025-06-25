package com.cooltomato.pomki.tag.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final CardRepository cardRepository; 
    private final MemberRepository memberRepository;

    public TagResponseDto createOneTagService(PrincipalMember principal, Long cardId, String tagName) {
        Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("해당하는 카드가 없습니다"));
    
        // 카드의 주인 확인
        Long memberId = card.getDeck().getMemberId();

        if (!memberId.equals(principal.getMemberId())) {
            throw new RuntimeException("해당 카드의 주인이 아닙니다.");
        }

        // if (!card.getMember().getMemberId().equals(principal.getMemberId())) {
        //     throw new RuntimeException("해당 카드의 주인이 아닙니다.");
        // }
    

        Member member = memberRepository.findById(memberId).get();

        Tag tag = Tag.builder()
            .member(member)
            .card(card)
            .tagName(tagName)
            .build();
    
        tagRepository.save(tag);
    
        return TagResponseDto.builder()
            .tagId(tag.getTagId())
            .tagName(tag.getTagName())
            .memberId(tag.getMember().getMemberId())
            .build();
    }
    
    public void deleteOneTagService(PrincipalMember principal, Long tagId) {
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new RuntimeException("해당하는 태그가 없습니다"));
    
        if (!tag.getMember().getMemberId().equals(principal.getMemberId())) {
            throw new RuntimeException("해당 태그의 주인이 아닙니다.");
        }
    
        tagRepository.deleteById(tagId);
    }
    
    public List<TagResponseDto> searchAllTagsService(PrincipalMember principal) {
        List<Tag> tags = tagRepository.findAllByMember_MemberId(principal.getMemberId());
        return tags.stream()
            .map(tag -> TagResponseDto.builder()
                .tagId(tag.getTagId())
                .tagName(tag.getTagName())
                .memberId(tag.getMember().getMemberId())
                .build())
            .collect(Collectors.toList());
    }

    
} 