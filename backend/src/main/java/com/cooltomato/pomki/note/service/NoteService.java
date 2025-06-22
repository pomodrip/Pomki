package com.cooltomato.pomki.note.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.dto.NoteRequestDto;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {
    
    private final NoteRepository noteRepository;
    private final MemberRepository memberRepository;
    
    @Transactional
    public Note createNote(NoteRequestDto noteRequestDto, PrincipalMember principal) {
        Member member = memberRepository.findById(principal.getMemberInfo().getMemberId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        
        Note note = Note.builder()
                .member(member)
                .noteTitle(noteRequestDto.getNoteTitle())
                .noteContent(noteRequestDto.getNoteContent())
                .build();
                
        return noteRepository.save(note);
    }
    
    public List<Note> readNote(PrincipalMember principal) {
        return noteRepository.findByMemberMemberIdOrderByCreatedAtDesc(
                principal.getMemberInfo().getMemberId());
    }
    
    public Note readNoteById(String noteId, PrincipalMember principal) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));
                
        // 소유자 확인
        if (!note.getMember().getMemberId().equals(principal.getMemberInfo().getMemberId())) {
            throw new NotFoundException("접근 권한이 없습니다.");
        }
        
        return note;
    }
    
    @Transactional
    public void updateNote(String noteId, NoteRequestDto noteRequestDto, PrincipalMember principal) {
        Note note = readNoteById(noteId, principal); // 소유자 확인 포함
        note.updateNote(noteRequestDto.getNoteTitle(), noteRequestDto.getNoteContent());
    }
    
    @Transactional
    public void deleteNote(String noteId, PrincipalMember principal) {
        Note note = readNoteById(noteId, principal); // 소유자 확인 포함
        noteRepository.delete(note);
    }
} 