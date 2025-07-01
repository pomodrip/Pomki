package com.cooltomato.pomki.bookmark.service;

import com.cooltomato.pomki.bookmark.dto.BookmarkDto;
import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.entity.BookmarkId;
import com.cooltomato.pomki.bookmark.repository.BookmarkRepository;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final MemberRepository memberRepository;
    private final NoteRepository noteRepository;

    @Transactional
    public void addBookmark(Long memberId, String noteId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("Member not found"));
        
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new NotFoundException("Note not found"));

        // 이미 북마크가 존재하는지 확인
        if (bookmarkRepository.existsByMemberMemberIdAndNoteNoteId(memberId, noteId)) {
            return; // 이미 존재하면 무시
        }

        Bookmark bookmark = Bookmark.builder()
                .member(member)
                .note(note)
                .build();

        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(Long memberId, String noteId) {
        bookmarkRepository.deleteByMemberMemberIdAndNoteNoteId(memberId, noteId);
    }

    public List<BookmarkDto> getBookmarks(Long memberId) {
        List<Bookmark> bookmarks = bookmarkRepository.findByMemberMemberId(memberId);
        
        return bookmarks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public boolean isBookmarked(Long memberId, String noteId) {
        return bookmarkRepository.existsByMemberMemberIdAndNoteNoteId(memberId, noteId);
    }

    private BookmarkDto convertToDto(Bookmark bookmark) {
        Note note = bookmark.getNote();
        
        return BookmarkDto.builder()
                .noteId(note.getNoteId())
                .noteTitle(note.getNoteTitle())
                .noteContent(note.getNoteContent())
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
} 