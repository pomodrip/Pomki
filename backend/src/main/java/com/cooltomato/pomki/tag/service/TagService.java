package com.cooltomato.pomki.tag.service;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.tag.dto.TagRequestDto;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.entity.TagCard;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final CardRepository cardRepository; 
    
    public TagResponseDto createOneTagService(PrincipalMember principal, Long cardId, String tagName) {
        // 1. Card와 Tag를 미리 조회하거나 생성
        Card card = cardRepository.findById(cardId).orElseThrow(()-> new RuntimeException("해당하는 카드가 없습니다"));
        
        Tag tag = Tag.builder()
            .memberId(principal.getMemberId())
            .tagName(tagName)
            .build();

        // 2. TagCardId 생성
        // TagCard.TagCardId tagCardId = new TagCard.TagCardId(card.getCardId(), null); // tagId는 Tag 저장 후 할당
        TagCard.TagCardId tagCardId = TagCard.TagCardId.builder()
                                                            .cardId(card.getCardId())
                                                            .tagId(null) // 또는 필요시 생략
                                                        .build();

        // 3. TagCard 생성 (Tag는 아직 영속화 전이므로 tagId가 null일 수 있음)
        TagCard tagCard = TagCard.builder()
            .id(tagCardId)
            .card(card)
            .tag(tag)
            .build();

        // 4. Tag에 TagCard 추가
        tag.getCardTags().add(tagCard);

        // 5. Tag 저장 (cascade = PERSIST로 TagCard도 같이 저장됨)
        tagRepository.save(tag);

        return TagResponseDto.builder()
                                .tagId(tag.getTagId())
                                .tagName(tag.getTagName())
                                .memberId(tag.getMemberId())
                            .build() ;
        
    }

    public String deleteOneTagService(PrincipalMember principal, Long tagId) {
        
        Tag tag = tagRepository.findById(tagId).orElseThrow(()-> new RuntimeException("해당하는 태그가 없습니다"));
        
        
        if(tag.getMemberId() != principal.getMemberId()) {
            throw new RuntimeException("해당 태그의 주인이 아닙니다: 태그 주인 - " + tag.getMemberId() + "/" + "현재 사용자 - " + principal.getMemberId());
        }


        // 태그 삭제
        tagRepository.deleteById(tagId);
        
        return "태그 삭제 성공";

    }
} 