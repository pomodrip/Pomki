package com.cooltomato.pomki.note.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {
    private final NoteRepository noteRepository;
    private final MemberRepository memberRepository;

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

        Note savedNote = noteRepository.save(note);
        return NoteResponseDto.from(savedNote);
    }

    public List<NoteListResponseDto> readNote(PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        List<Note> notes = noteRepository.findAllByMemberAndIsDeletedIsFalse(member);
        return notes.stream()
                .map(NoteListResponseDto::from)
                .collect(Collectors.toList());
    }

    public NoteResponseDto readNoteById(String id, PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        Note note = getNote(id, member);
        return NoteResponseDto.from(note);
    }

    @Transactional
    public void deleteNote(String id, PrincipalMember memberInfoDto) {
        Member member = getMember(memberInfoDto.getMemberId());
        Note note = getNote(id, member);
        note.setIsDeleted(true);
        note.setUpdatedAt(LocalDateTime.now());
        noteRepository.save(note);
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
        return NoteResponseDto.from(note);
    }

    private Member getMember(Long memberId) {
        return memberRepository.findByIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
    }

    private Note getNote(String noteId, Member member) {
        return noteRepository.findByNoteIdAndMemberAndIsDeletedIsFalse(noteId, member)
                .orElseThrow(() -> new NoteNotFoundException());
    }
}