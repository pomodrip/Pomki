package com.cooltomato.pomki.notetag.service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.cardtag.repository.CardTagRepository;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.notetag.dto.NoteTagRequestDto;
import com.cooltomato.pomki.notetag.dto.NoteTagResponseDto;
import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.notetag.entity.NoteTagId;
import com.cooltomato.pomki.notetag.repository.NoteTagRepository;
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
public class NoteTagService {

    private final NoteTagRepository noteTagRepository ;
    private final TagRepository tagRepository ;
    private final NoteRepository noteRepository ;
    private final CardTagRepository cardTagRepository ;

    public List<NoteTagResponseDto> readAllNoteTagService(PrincipalMember principal) {
        List<NoteTag> NoteTagList = noteTagRepository.findByMemberId(principal.getMemberId());
        return NoteTagList.stream()
                .map(noteTag -> NoteTagResponseDto.builder()
                        .noteId(noteTag.getNoteId())
                        .memberId(noteTag.getMemberId())
                        .tagNames(noteTag.getTagName())
                        .build())
                .collect(Collectors.toList());
      }
    
    public List<NoteTagResponseDto> createNoteTagService(PrincipalMember principal, NoteTagRequestDto request) {
        log.info("debug >>> 노트에 태그 추가 시작") ;
        
        Note note = noteRepository.findById(request.getNoteId())
            .orElseThrow(() -> new RuntimeException("Note not found with id: " + request.getNoteId()));
        
        if (!note.getMember().getMemberId().equals(principal.getMemberId())) {
            throw new RuntimeException("Note does not belong to the current member");
        }

        if (note.getIsDeleted()) {
            throw new RuntimeException("삭제된 노트에는 태그를 추가할 수 없습니다.");
        }

        List<NoteTagResponseDto> createdTags = new ArrayList<>();

        for (String tagName : request.getTagNames()) {
            NoteTag entity = NoteTag.builder()
                                    .noteId(request.getNoteId())
                                    .memberId(principal.getMemberId())
                                    .tagName(tagName)
                                    .note(note)  // Set the note for @MapsId relationship
                                .build();
            noteTagRepository.save(entity) ;

            createdTags.add(NoteTagResponseDto.builder()
                        .noteId(request.getNoteId())
                        .memberId(principal.getMemberId())
                        .tagNames(tagName)
                        .build());

            if (tagRepository.findById(TagId.builder()
                                .tagName(tagName)
                                .memberId(principal.getMemberId())
                                .build()).isPresent()) {
            log.info("debug >>> 이미 존재하는 태그입니다.") ;
        } else {
            tagRepository.save(Tag.builder()
                                .tagName(tagName)
                                .memberId(principal.getMemberId())
                                .build()) ;
            log.info("debug >>> Tag에 추가 완료") ;
        }
        }
        
        return createdTags ;
       
    }


    public void deleteNoteTagService(PrincipalMember principal, String noteId, String tagName) {
        NoteTagId noteTagIdEntity = NoteTagId.builder()
                                .noteId(noteId)
                                .memberId(principal.getMemberId())
                                .tagName(tagName)
                                .build() ;

        noteTagRepository.deleteById(noteTagIdEntity) ;

        log.info("debug >>> 해당 태그가 다른 노트에서도 사용되는지 확인");
        Long remainingNoteTagCount = noteTagRepository.countByTagNameAndMemberId(
            tagName, principal.getMemberId());
        
        Long cardTagCount = cardTagRepository.countByTagNameAndMemberId(tagName, principal.getMemberId());
        
        // 다른 노트에서 사용되지 않는다면 Tag 테이블에서도 삭제
        if (remainingNoteTagCount == 0 && cardTagCount == 0) {
            log.info("debug >>> Tag에서 삭제 시작 (다른 노트에서 사용되지 않음)") ;
            
            TagId tagIdEntity = TagId.builder()
                                    .tagName(tagName)
                                    .memberId(principal.getMemberId())
                                    .build() ;

            tagRepository.deleteById(tagIdEntity) ;
            log.info("debug >>> Tag에서 삭제 완료") ;
            
        } else {
            log.info("debug >>> Tag는 유지 (다른 노트에서 {}개 사용 중)", remainingNoteTagCount) ;
            
        }
    }

    public List<NoteResponseDto> readNoteByTagNameService(PrincipalMember principal, String tagName) {
      List<NoteTag> allSameTagName = noteTagRepository.findAllNoteIdByMemberIdAndTagName(principal.getMemberId(), tagName) ;

      List<Note> NotesWithTagName = noteRepository.findAllById(allSameTagName.stream()
                                                                                    .map(NoteTag::getNoteId)
                                                                                    .collect(Collectors.toList())) ;
      List<NoteResponseDto> response = NotesWithTagName.stream()
                                                            .map(NoteResponseDto::from)
                                                            .collect(Collectors.toList()) ;
      return response ;
    }
;


    
}
