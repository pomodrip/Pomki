package com.cooltomato.pomki.tag.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.tag.dto.TagResponseDto;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagService {

  private final TagRepository tagRepository ;


  public List<TagResponseDto> readAllNoteTagService(PrincipalMember principal) {
    log.info("debug >>> 모든 태그 전체 조회 시작") ;
    List<Tag> allTagsNoteAndCard = tagRepository.findByMemberId(principal.getMemberId()) ;
    List<TagResponseDto> response = allTagsNoteAndCard.stream()
                                                        .map(tag -> TagResponseDto.builder()
                                                        .tagName(tag.getTagName())
                                                        .memberId(tag.getMemberId())
                                                        .build())
                                                        .collect(Collectors.toList()) ;
    
    return response ;
  }
    
}
