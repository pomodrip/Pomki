package com.cooltomato.pomki.tag.service;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.tag.dto.TagRequestDto;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    public TagResponseDto createOneTagService(PrincipalMember principal, String tagName) {
        
        Tag tag = Tag.builder()
                        .tagName(tagName)
                        .memberId(principal.getMemberId())
                        .build();
        tagRepository.save(tag);

        return TagResponseDto.builder()
                                .tagId(tag.getTagId())
                                .tagName(tag.getTagName())
                                .memberId(tag.getMemberId())
                            .build() ;
        
    }
} 