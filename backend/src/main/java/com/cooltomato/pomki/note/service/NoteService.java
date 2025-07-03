package com.cooltomato.pomki.note.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.repository.BookmarkRepository;
import com.cooltomato.pomki.cardtag.repository.CardTagRepository;
import com.cooltomato.pomki.global.exception.MemberNotFoundException;
import com.cooltomato.pomki.global.exception.NoteNotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.dto.NoteCreateRequestDto;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.dto.NoteListResponseDto;
import com.cooltomato.pomki.note.dto.NoteUpdateRequestDto;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.noteimage.entity.NoteImage;
import com.cooltomato.pomki.notetag.entity.NoteTag;
import com.cooltomato.pomki.notetag.repository.NoteTagRepository;
import com.cooltomato.pomki.tag.entity.Tag;
import com.cooltomato.pomki.tag.entity.TagId;
import com.cooltomato.pomki.tag.repository.TagRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class NoteService {
    private final NoteRepository noteRepository;
    private final MemberRepository memberRepository;
    private final NoteTagRepository noteTagRepository;
    private final TagRepository tagRepository;
    private final CardTagRepository cardTagRepository;
    private final BookmarkRepository bookmarkRepository;

    @Transactional
    public NoteResponseDto createNote(NoteCreateRequestDto noteRequestDto, PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());

        Note note = new Note();
        note.setNoteId(UUID.randomUUID().toString());
        note.setMember(member);
        note.setNoteTitle(noteRequestDto.getNoteTitle());
        note.setNoteContent(noteRequestDto.getNoteContent());
        note.setOriginalContent(noteRequestDto.getOriginalContent());
        note.setAiEnhanced(noteRequestDto.getAiEnhanced());
        note.setCreatedAt(LocalDateTime.now());
        note.setIsDeleted(false);
        note.setIsDeleted(false);

        NoteResponseDto noteResponseDto = NoteResponseDto.from(note);
        noteResponseDto.setIsBookmarked(false);

        Note savedNote = noteRepository.save(note);
        return NoteResponseDto.from(savedNote);
    }

    public List<NoteListResponseDto> readNote(PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        List<Note> notes = noteRepository.findAllByMemberAndIsDeletedIsFalse(member);
        List<NoteListResponseDto> noteListResponseDtos = new ArrayList<>();
        List<Bookmark> bookmarkedNotes = bookmarkRepository.findByMemberMemberId(member.getMemberId());
        for(Note note : notes) {
            List<String> tags = noteTagRepository.findTagNameByNoteIdAndMemberId(note.getNoteId(), member.getMemberId());
            NoteListResponseDto noteListResponseDto = NoteListResponseDto.from(note);
            noteListResponseDto.setTags(tags);
            noteListResponseDto.setIsBookmarked(bookmarkedNotes.stream().anyMatch(bookmark -> bookmark.getNote().getNoteId().equals(note.getNoteId())));
            noteListResponseDtos.add(noteListResponseDto);
        }
        return noteListResponseDtos;
    }

    public NoteResponseDto readNoteById(String id, PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        Note note = getNote(id, member);
        List<String> tags = noteTagRepository.findTagNameByNoteIdAndMemberId(id, member.getMemberId());
        NoteResponseDto noteResponseDto = NoteResponseDto.from(note);
        noteResponseDto.setTags(tags);
        
        Optional<Bookmark> bookmarked = bookmarkRepository.findByMemberMemberIdAndNoteNoteId(member.getMemberId(), note.getNoteId());

        if(bookmarked.isPresent()) {
            noteResponseDto.setIsBookmarked(true);
        } else {
            noteResponseDto.setIsBookmarked(false);
        }
        return noteResponseDto;
    }

    @Transactional
    public void deleteNote(String id, PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        Note note = getNote(id, member);
        note.setIsDeleted(true);
        note.setUpdatedAt(LocalDateTime.now());
        noteRepository.save(note);

        bookmarkRepository.deleteByMemberMemberIdAndNoteNoteId(memberInfoDto.getMemberId(), id);

        // 카드 태그 삭제 전에 태그 이름들을 먼저 저장
        List<NoteTag> noteTags = noteTagRepository.findByNote_NoteId(id);
        List<String> noteTagNames = noteTags.stream()
                .map(NoteTag::getTagName)
                .collect(Collectors.toList());
        
        // 카드 태그는 엔터티 관계상 자동으로 삭제되므로 별도 삭제 불필요
        noteTagRepository.deleteAll(noteTags);

        // 다른 카드에서 해당 태그를 사용하지 않고 노트에 대해서도 해당 태그가 없다면 태그 테이블에서 삭제
        for(String tagName : noteTagNames) {
            // 다른 노트에서 해당 태그 사용 여부 확인
            long remainingNoteTagCount = noteTagRepository.countByTagNameAndMemberId(tagName, memberInfoDto.getMemberId());
            
            // 카드에서 해당 태그 사용 여부 확인
            long cardTagCount = cardTagRepository.countByTagNameAndMemberId(tagName, memberInfoDto.getMemberId());
            
            // 카드와 노트 모두에서 해당 태그를 사용하지 않으면 태그 테이블에서 삭제
            if(remainingNoteTagCount == 0 && cardTagCount == 0) {
                Optional<Tag> tag = tagRepository.findByMemberIdAndTagName(memberInfoDto.getMemberId(), tagName);
                tag.ifPresent(tagRepository::delete);
                log.info("debug >>> CardService deleteNote 태그 삭제 완료: " + tagName);
            }
        }

        
        
    }
    @Transactional
    public NoteResponseDto updateNote(String id, NoteUpdateRequestDto noteRequestDto, PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        Note note = getNote(id, member);

        note.setNoteTitle(noteRequestDto.getNoteTitle());
        note.setNoteContent(noteRequestDto.getNoteContent());
        note.setAiEnhanced(noteRequestDto.getAiEnhanced());
        note.setUpdatedAt(LocalDateTime.now());
        noteRepository.save(note);

        List<NoteTag> noteTags = noteTagRepository.findByNoteId(id);
        List<String> tagNames = noteTags.stream()
                .map(NoteTag::getTagName)
                .collect(Collectors.toList());

        NoteResponseDto noteResponseDto = NoteResponseDto.from(note);
        noteResponseDto.setTags(tagNames);

        return noteResponseDto;
    }

    private Member getMember(Long memberId) {
        return memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
    }

    private Note getNote(String noteId, Member member) {
        return noteRepository.findByNoteIdAndMemberAndIsDeletedIsFalse(noteId, member)
                .orElseThrow(() -> new NoteNotFoundException());
    }
}