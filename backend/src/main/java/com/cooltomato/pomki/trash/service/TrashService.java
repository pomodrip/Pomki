package com.cooltomato.pomki.trash.service;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.card.entity.Card;
import com.cooltomato.pomki.card.repository.CardRepository;
import com.cooltomato.pomki.deck.entity.Deck;
import com.cooltomato.pomki.deck.repository.DeckRepository;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import com.cooltomato.pomki.trash.dto.TrashItemDto;
import com.cooltomato.pomki.trash.dto.TrashResponseDto;
import com.cooltomato.pomki.trash.entity.*;
import com.cooltomato.pomki.trash.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TrashService {
    
    private final TrashRepository trashRepository;
    private final TrashDeckRepository trashDeckRepository;
    private final TrashCardRepository trashCardRepository;
    private final TrashNoteRepository trashNoteRepository;
    private final DeckRepository deckRepository;
    private final CardRepository cardRepository;
    private final NoteRepository noteRepository;
    private final MemberRepository memberRepository;
    
    /**
     * 사용자의 쓰레기통 목록 조회
     */
    public TrashResponseDto getTrashItems(PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        List<Trash> trashList = trashRepository.findByMember_MemberIdOrderByDeletedAtDesc(memberId);
        List<TrashItemDto> items = new ArrayList<>();
        
        for (Trash trash : trashList) {
            // 덱 확인
            List<TrashDeck> trashDecks = trashDeckRepository.findByIdTrashId(trash.getTrashId());
            for (TrashDeck trashDeck : trashDecks) {
                Optional<Deck> deck = deckRepository.findById(trashDeck.getDeckId());
                if (deck.isPresent()) {
                    items.add(TrashItemDto.builder()
                            .trashId(trash.getTrashId())
                            .itemId(trashDeck.getDeckId())
                            .itemType("DECK")
                            .itemTitle(deck.get().getDeckName())
                            .itemContent("카드 " + deck.get().getCardCnt() + "개")
                            .deletedAt(trash.getDeletedAt())
                            .build());
                }
            }
            
            // 카드 확인
            List<TrashCard> trashCards = trashCardRepository.findByIdTrashId(trash.getTrashId());
            for (TrashCard trashCard : trashCards) {
                Optional<Card> card = cardRepository.findById(trashCard.getCardId());
                if (card.isPresent()) {
                    items.add(TrashItemDto.builder()
                            .trashId(trash.getTrashId())
                            .itemId(String.valueOf(trashCard.getCardId()))
                            .itemType("CARD")
                            .itemTitle(card.get().getContent().substring(0, Math.min(50, card.get().getContent().length())))
                            .itemContent(card.get().getAnswer().substring(0, Math.min(100, card.get().getAnswer().length())))
                            .deletedAt(trash.getDeletedAt())
                            .build());
                }
            }
            
            // 노트 확인
            List<TrashNote> trashNotes = trashNoteRepository.findByIdTrashId(trash.getTrashId());
            for (TrashNote trashNote : trashNotes) {
                Optional<Note> note = noteRepository.findById(trashNote.getNoteId());
                if (note.isPresent()) {
                    items.add(TrashItemDto.builder()
                            .trashId(trash.getTrashId())
                            .itemId(trashNote.getNoteId())
                            .itemType("NOTE")
                            .itemTitle(note.get().getNoteTitle())
                            .itemContent(note.get().getNoteContent().substring(0, Math.min(200, note.get().getNoteContent().length())))
                            .deletedAt(trash.getDeletedAt())
                            .build());
                }
            }
        }
        
        return TrashResponseDto.builder()
                .items(items)
                .totalCount(items.size())
                .message("쓰레기통 목록을 성공적으로 조회했습니다.")
                .build();
    }
    
    /**
     * 덱을 쓰레기통으로 이동
     */
    @Transactional
    public void moveDeckToTrash(String deckId, PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        // 덱 존재 확인
        Deck deck = deckRepository.findByMemberIdAndDeckIdAndIsDeletedFalse(memberId, deckId)
                .orElseThrow(() -> new NotFoundException("덱을 찾을 수 없습니다."));
        
        // Member 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));
        
        // 쓰레기통 엔트리 생성
        Trash trash = Trash.builder()
                .member(member)
                .build();
        trashRepository.save(trash);
        
        // 쓰레기통 덱 엔트리 생성
        TrashDeckId trashDeckId = new TrashDeckId(deckId, trash.getTrashId());
        TrashDeck trashDeck = TrashDeck.builder()
                .id(trashDeckId)
                .build();
        trashDeckRepository.save(trashDeck);
        
        // 덱을 삭제 상태로 변경
        deck.setIsDeleted(true);
        deckRepository.save(deck);
        
        log.info("덱이 쓰레기통으로 이동되었습니다. deckId: {}, memberId: {}", deckId, memberId);
    }
    
    /**
     * 카드를 쓰레기통으로 이동
     */
    @Transactional
    public void moveCardToTrash(Long cardId, PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        // 카드 존재 확인
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("카드를 찾을 수 없습니다."));
        
        // 카드 소유권 확인
        if (!card.getDeck().getMemberId().equals(memberId)) {
            throw new NotFoundException("카드에 대한 권한이 없습니다.");
        }
        
        // Member 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));
        
        // 쓰레기통 엔트리 생성
        Trash trash = Trash.builder()
                .member(member)
                .build();
        trashRepository.save(trash);
        
        // 쓰레기통 카드 엔트리 생성
        TrashCardId trashCardId = new TrashCardId(cardId, trash.getTrashId());
        TrashCard trashCard = TrashCard.builder()
                .id(trashCardId)
                .build();
        trashCardRepository.save(trashCard);
        
        // 카드를 삭제 상태로 변경
        card.setIsDeleted(true);
        cardRepository.save(card);
        
        log.info("카드가 쓰레기통으로 이동되었습니다. cardId: {}, memberId: {}", cardId, memberId);
    }
    
    /**
     * 노트를 쓰레기통으로 이동
     */
    @Transactional
    public void moveNoteToTrash(String noteId, PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        // 노트 존재 확인
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("노트를 찾을 수 없습니다."));
        
        // 노트 소유권 확인
        if (!note.getMember().getMemberId().equals(memberId)) {
            throw new NotFoundException("노트에 대한 권한이 없습니다.");
        }
        
        // Member 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));
        
        // 쓰레기통 엔트리 생성
        Trash trash = Trash.builder()
                .member(member)
                .build();
        trashRepository.save(trash);
        
        // 쓰레기통 노트 엔트리 생성
        TrashNoteId trashNoteId = new TrashNoteId(noteId, trash.getTrashId());
        TrashNote trashNote = TrashNote.builder()
                .id(trashNoteId)
                .build();
        trashNoteRepository.save(trashNote);
        
        // 노트를 삭제 상태로 변경
        note.setIsDeleted(true);
        noteRepository.save(note);
        
        log.info("노트가 쓰레기통으로 이동되었습니다. noteId: {}, memberId: {}", noteId, memberId);
    }
    
    /**
     * 쓰레기통에서 복원
     */
    @Transactional
    public void restoreFromTrash(String trashId, PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        Trash trash = trashRepository.findById(trashId)
                .orElseThrow(() -> new NotFoundException("쓰레기통 항목을 찾을 수 없습니다."));
        
        if (!trash.getMemberId().equals(memberId)) {
            throw new NotFoundException("권한이 없습니다.");
        }
        
        // 덱 복원
        List<TrashDeck> trashDecks = trashDeckRepository.findByIdTrashId(trashId);
        for (TrashDeck trashDeck : trashDecks) {
            Optional<Deck> deck = deckRepository.findById(trashDeck.getDeckId());
            if (deck.isPresent()) {
                deck.get().setIsDeleted(false);
                deckRepository.save(deck.get());
            }
        }
        
        // 카드 복원
        List<TrashCard> trashCards = trashCardRepository.findByIdTrashId(trashId);
        for (TrashCard trashCard : trashCards) {
            Optional<Card> card = cardRepository.findById(trashCard.getCardId());
            if (card.isPresent()) {
                card.get().setIsDeleted(false);
                cardRepository.save(card.get());
            }
        }
        
        // 노트 복원
        List<TrashNote> trashNotes = trashNoteRepository.findByIdTrashId(trashId);
        for (TrashNote trashNote : trashNotes) {
            Optional<Note> note = noteRepository.findById(trashNote.getNoteId());
            if (note.isPresent()) {
                note.get().setIsDeleted(false);
                noteRepository.save(note.get());
            }
        }
        
        // 쓰레기통에서 제거
        trashDeckRepository.deleteByIdTrashId(trashId);
        trashCardRepository.deleteByIdTrashId(trashId);
        trashNoteRepository.deleteByIdTrashId(trashId);
        trashRepository.delete(trash);
        
        log.info("쓰레기통에서 복원되었습니다. trashId: {}, memberId: {}", trashId, memberId);
    }
    
    /**
     * 쓰레기통에서 영구 삭제
     */
    @Transactional
    public void permanentDelete(String trashId, PrincipalMember principal) {
        Long memberId = principal.getMemberInfo().getMemberId();
        
        Trash trash = trashRepository.findById(trashId)
                .orElseThrow(() -> new NotFoundException("쓰레기통 항목을 찾을 수 없습니다."));
        
        if (!trash.getMemberId().equals(memberId)) {
            throw new NotFoundException("권한이 없습니다.");
        }
        
        // 덱 영구 삭제
        List<TrashDeck> trashDecks = trashDeckRepository.findByIdTrashId(trashId);
        for (TrashDeck trashDeck : trashDecks) {
            deckRepository.deleteById(trashDeck.getDeckId());
        }
        
        // 카드 영구 삭제
        List<TrashCard> trashCards = trashCardRepository.findByIdTrashId(trashId);
        for (TrashCard trashCard : trashCards) {
            cardRepository.deleteById(trashCard.getCardId());
        }
        
        // 노트 영구 삭제
        List<TrashNote> trashNotes = trashNoteRepository.findByIdTrashId(trashId);
        for (TrashNote trashNote : trashNotes) {
            noteRepository.deleteById(trashNote.getNoteId());
        }
        
        // 쓰레기통에서 제거
        trashDeckRepository.deleteByIdTrashId(trashId);
        trashCardRepository.deleteByIdTrashId(trashId);
        trashNoteRepository.deleteByIdTrashId(trashId);
        trashRepository.delete(trash);
        
        log.info("쓰레기통에서 영구 삭제되었습니다. trashId: {}, memberId: {}", trashId, memberId);
    }
    
    /**
     * 30일 이상 된 쓰레기통 항목 자동 삭제
     */
    @Transactional
    public void cleanupOldTrashItems() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);
        
        List<Trash> oldTrashItems = trashRepository.findAll().stream()
                .filter(trash -> trash.getDeletedAt().isBefore(cutoffDate))
                .toList();
        
        for (Trash trash : oldTrashItems) {
            // 시스템에서 직접 삭제 (권한 체크 없이)
            String trashId = trash.getTrashId();
            
            // 덱 영구 삭제
            List<TrashDeck> trashDecks = trashDeckRepository.findByIdTrashId(trashId);
            for (TrashDeck trashDeck : trashDecks) {
                deckRepository.deleteById(trashDeck.getDeckId());
            }
            
            // 카드 영구 삭제
            List<TrashCard> trashCards = trashCardRepository.findByIdTrashId(trashId);
            for (TrashCard trashCard : trashCards) {
                cardRepository.deleteById(trashCard.getCardId());
            }
            
            // 노트 영구 삭제
            List<TrashNote> trashNotes = trashNoteRepository.findByIdTrashId(trashId);
            for (TrashNote trashNote : trashNotes) {
                noteRepository.deleteById(trashNote.getNoteId());
            }
            
            // 쓰레기통에서 제거
            trashDeckRepository.deleteByIdTrashId(trashId);
            trashCardRepository.deleteByIdTrashId(trashId);
            trashNoteRepository.deleteByIdTrashId(trashId);
            trashRepository.delete(trash);
        }
        
        log.info("30일 이상 된 쓰레기통 항목 {} 개가 자동 삭제되었습니다.", oldTrashItems.size());
    }
} 