package com.cooltomato.pomki.notetag.service;

import java.security.Principal;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.notetag.dto.NoteTagRequestDto;
import com.cooltomato.pomki.notetag.dto.NoteTagResponseDto;
import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.notetag.repository.NoteTagRepository;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Builder
@Service
@RequiredArgsConstructor
@Slf4j
public class NoteTagService {

    private final NoteTagRepository noteTagRepository ;
    private final TagRepository tagRepository ;
    
    public NoteTagResponseDto createNoteTagService(PrincipalMember principal, NoteTagRequestDto request) {
        NoteTag entity = NoteTag.builder()
                                    .noteId(request.getNoteId())
                                    .memberId(principal.getMemberId())
                                    .tagName(request.getTagName())
                                .build();
        
        noteTagRepository.save(entity) ;
        
        return NoteTagResponseDto.builder()
                                .noteId(request.getNoteId())
                                .memberId(principal.getMemberId())
                                .tagName(request.getTagName())
                                .build() ;
       
    }


    
}
