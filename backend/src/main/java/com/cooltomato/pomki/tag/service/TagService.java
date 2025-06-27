package com.cooltomato.pomki.tag.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.dto.CardResponseDto;
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
    
    public List<String> searchAllTagsService(PrincipalMember principal) {
        List<Tag> tags = tagRepository.findAllByMember_MemberId(principal.getMemberId());

        List<String> distinctOnlyTagsNames = tags.stream()
            .collect(Collectors.toMap(
                Tag::getTagName,  // 태그 이름을 키로 사용
                tag -> tag,       // 태그 객체를 값으로 사용
                (existing, replacement) -> existing  // 중복 시 기존 것 유지
            ))
            .values()
            .stream()
            .map(tag -> tag.getTagName())
            .collect(Collectors.toList());

        if (distinctOnlyTagsNames.isEmpty()) {
            throw new RuntimeException("생성한 태그가 없습니다.");
        }
        
        // 태그 이름을 기준으로 중복 제거
        return distinctOnlyTagsNames ;
    }

    public List<Card> searchAllCardsByTagService(PrincipalMember principal, String tagName) {
        // 각 태그에 해당하는 카드 가져오기
        List<Tag> tags = tagRepository.findAllByMember_MemberIdAndTagName(principal.getMemberId(), tagName);

        // 각 태그에 해당하는 카드 가져오기
        List<Card> cards = tags.stream()
            .map(tag -> tag.getCard())
            .collect(Collectors.toList());
        
        if (cards.isEmpty()) {
            throw new RuntimeException("찾으시는 태그에 해당하는 카드가 없습니다.");
        }
        
        return cards ;
    }

    
} 