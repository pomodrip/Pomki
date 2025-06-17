package com.cooltomato.pomki.note.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.cooltomato.pomki.auth.dto.MemberInfoDto;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.dto.NoteRequestDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public Note createNote(NoteRequestDto noteRequestDto, MemberInfoDto memberInfoDto) {
        Member member = memberRepository.findById(memberInfoDto.getId())
                .orElseThrow(() -> new NotFoundException("Member not found"));

        Note note = new Note();
        note.setNoteId(UUID.randomUUID().toString());
        note.setMember(member);
        note.setNoteTitle(noteRequestDto.getNoteTitle());
        note.setNoteContent(noteRequestDto.getNoteContent());
        note.setOriginalContent(noteRequestDto.getOriginalContent());
        note.setAiEnhanced(noteRequestDto.getAiEnhanced());
        note.setCreatedAt(LocalDateTime.now());
        note.setIsDeleted(false);

        return noteRepository.save(note);
    }

    public List<Note> readNote(MemberInfoDto memberInfoDto) {
        Member member = memberRepository.findById(memberInfoDto.getId())
                .orElseThrow(() -> new NotFoundException("Member not found"));
        return noteRepository.findAllByMemberAndIsDeletedIsFalse(member);
    }

    public Note readNoteById(String id, MemberInfoDto memberInfoDto) {
        Member member = memberRepository.findById(memberInfoDto.getId())
                .orElseThrow(() -> new NotFoundException("Member not found"));
        return noteRepository.findByNoteIdAndMemberAndIsDeletedIsFalse(id, member)
                .orElseThrow(() -> new NotFoundException("Note not found"));
    }


    @Transactional
    public void deleteNote(String id, MemberInfoDto memberInfoDto) {
        Member member = memberRepository.findById(memberInfoDto.getId())
                .orElseThrow(() -> new NotFoundException("Member not found"));
        Note note = noteRepository.findByNoteIdAndMemberAndIsDeletedIsFalse(id, member)
                .orElseThrow(() -> new NotFoundException("Note not found"));
        note.setIsDeleted(true);
        note.setUpdatedAt(LocalDateTime.now());
        noteRepository.save(note);
    }
    @Transactional
    public void updateNote(String id, NoteRequestDto noteRequestDto, MemberInfoDto memberInfoDto) {
        Member member = memberRepository.findById(memberInfoDto.getId())
                .orElseThrow(() -> new NotFoundException("Member not found"));
        Note entity = noteRepository.findByNoteIdAndMemberAndIsDeletedIsFalse(id, member)
                .orElseThrow(() -> new NotFoundException("Note not found"));

        entity.setNoteTitle(noteRequestDto.getNoteTitle());
        entity.setNoteContent(noteRequestDto.getNoteContent());
        entity.setOriginalContent(noteRequestDto.getOriginalContent());
        entity.setUpdatedAt(LocalDateTime.now());
        noteRepository.save(entity);
    }
}