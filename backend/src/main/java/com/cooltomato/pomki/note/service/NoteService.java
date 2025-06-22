package com.cooltomato.pomki.note.service;

import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.note.dto.NoteDto;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.ai.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;
    // TODO: 향후 메시지 브로커 추가 예정
    // private final MessagePublisher messagePublisher;
    private final AIService aiService; // 통합된 AIService 주입
    /**
     * 노트 생성
     * 원본 내용을 original_content에 저장하고, note_content에는 동일한 내용을 저장
     */
    public NoteDto.Response createNote(Long memberId, NoteDto.CreateRequest request) {
        Note note = Note.builder()
                .memberId(memberId)
                .noteTitle(request.getNoteTitle())
                .noteContent(request.getNoteContent())
                .originalContent(request.getNoteContent()) // 원본 보존
                .aiEnhanced(false)
                .isDeleted(false)
                .build();

        Note savedNote = noteRepository.save(note);
        
        // TODO: 비동기 AI 처리를 위한 이벤트 발행
        // publishNoteCreatedEvent(savedNote);
        
        return NoteDto.Response.from(savedNote);
    }

    /**
     * 사용자의 노트 목록 조회 (페이지네이션)
     */
    @Transactional(readOnly = true)
    public Page<NoteDto.Response> getNotes(Long memberId, Pageable pageable) {
        Page<Note> notes = noteRepository.findByMemberIdAndIsDeletedFalseOrderByUpdatedAtDesc(memberId, pageable);
        return notes.map(NoteDto.Response::from);
    }

    /**
     * 특정 노트 조회
     */
    @Transactional(readOnly = true)
    public NoteDto.Response getNote(Long memberId, String noteId) {
        Note note = noteRepository.findByNoteIdAndMemberIdAndIsDeletedFalse(noteId, memberId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));
        return NoteDto.Response.from(note);
    }

    /**
     * 노트 수정
     */
    public NoteDto.Response updateNote(Long memberId, String noteId, NoteDto.UpdateRequest request) {
        Note note = noteRepository.findByNoteIdAndMemberIdAndIsDeletedFalse(noteId, memberId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));

        note.setNoteTitle(request.getNoteTitle());
        note.setNoteContent(request.getNoteContent());
        
        // 내용이 변경되면 AI 향상 상태를 초기화
        if (!note.getOriginalContent().equals(request.getNoteContent())) {
            note.setOriginalContent(request.getNoteContent());
            note.setAiEnhanced(false);
        }

        Note updatedNote = noteRepository.save(note);
        return NoteDto.Response.from(updatedNote);
    }

    /**
     * 노트 삭제 (논리적 삭제)
     */
    public void deleteNote(Long memberId, String noteId) {
        Note note = noteRepository.findByNoteIdAndMemberIdAndIsDeletedFalse(noteId, memberId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));

        note.setDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
        
        log.info("노트가 휴지통으로 이동되었습니다. noteId: {}, memberId: {}", noteId, memberId);
    }

    /**
     * AI 노트 향상 요청 (비동기)
     * 현재는 로그만 출력, 향후 메시지 브로커 연동 예정
     */
    public void requestNotePolishing(Long memberId, String noteId, String promptName) {
        Note note = noteRepository.findByNoteIdAndMemberIdAndIsDeletedFalse(noteId, memberId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));

        // TODO: 메시지 브로커를 통한 비동기 AI 처리 요청
        // NotePolishRequestEvent event = new NotePolishRequestEvent(note.getNoteId(), memberId, promptName);
        // messagePublisher.publish("note.polish.request", event);
        
        log.info("AI 노트 향상 요청: noteId={}, memberId={}, promptName={}", noteId, memberId, promptName);
    }


    @Transactional
    public String polishNote(String noteId, String style, PrincipalMember principalMember) {
        // 사용자 및 노트 조회 로직
        Long memberId = principalMember.getMemberId();
        Note note = noteRepository.findByNoteIdAndMemberIdAndIsDeletedFalse(noteId, memberId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));

        // AI 서비스 실행
        String polishedContent = aiService.polishNote(note.getNoteContent(), style);

        // 노트 업데이트 및 저장 로직
        note.setNoteContent(polishedContent);
        note.setAiEnhanced(true);
        noteRepository.save(note);

        return polishedContent;
    }


    /**
     * 휴지통의 노트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<NoteDto.Response> getDeletedNotes(Long memberId) {
        List<Note> deletedNotes = noteRepository.findByMemberIdAndIsDeletedTrueOrderByDeletedAtDesc(memberId);
        return deletedNotes.stream()
                .map(NoteDto.Response::from)
                .toList();
    }

    /**
     * 노트 복원
     */
    public void restoreNote(Long memberId, String noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));

        if (!note.getMemberId().equals(memberId)) {
            throw new NotFoundException("노트를 찾을 수 없습니다.");
        }

        note.setDeleted(false);
        note.setDeletedAt(null);
        noteRepository.save(note);
        
        log.info("노트가 복원되었습니다. noteId: {}, memberId: {}", noteId, memberId);
    }

    // TODO: 향후 메시지 브로커 연동 메서드
    /*
    private void publishNoteCreatedEvent(Note note) {
        NoteCreatedEvent event = new NoteCreatedEvent(
            note.getNoteId(), 
            note.getMemberId(), 
            note.getOriginalContent()
        );
        messagePublisher.publish("note.created", event);
    }
    */
} 