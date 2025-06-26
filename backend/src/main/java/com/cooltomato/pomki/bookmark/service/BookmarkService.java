package com.cooltomato.pomki.bookmark.service;

import lombok.Builder;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.entity.Bookmark;
import com.cooltomato.pomki.bookmark.repository.BookmarkRepository;
import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.MemberNotFoundException;
import com.cooltomato.pomki.global.exception.NoteNotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import com.cooltomato.pomki.note.entity.Note;
import com.cooltomato.pomki.note.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cooltomato.pomki.bookmark.dto.BookmarkResponseDto;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final MemberRepository memberRepository;
    private final NoteRepository noteRepository;

    public void createBookmark(String noteId, PrincipalMember principalMember) {
        Member member = memberRepository.findById(principalMember.getMemberId())
                .orElseThrow(MemberNotFoundException::new);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(NoteNotFoundException::new);

        if (bookmarkRepository.findByMemberAndNote(member, note).isPresent()) {
            throw new BadRequestException("Bookmark already exists.");
        }

        Bookmark bookmark = Bookmark.builder()
                .member(member)
                .note(note)
                .build();

        bookmarkRepository.save(bookmark);
    }

    @Transactional(readOnly = true)
    public List<BookmarkResponseDto> getBookmarks(PrincipalMember principalMember) {
        Member member = memberRepository.findById(principalMember.getMemberId())
                .orElseThrow(MemberNotFoundException::new);
        List<Bookmark> bookmarks = bookmarkRepository.findAllByMember(member);
        return bookmarks.stream()
                .map(bookmark -> BookmarkResponseDto.from(bookmark.getNote()))
                .collect(Collectors.toList());
    }

    public void deleteBookmark(String noteId, PrincipalMember principalMember) {
        Member member = memberRepository.findById(principalMember.getMemberId())
                .orElseThrow(MemberNotFoundException::new);
        Note note = noteRepository.findById(noteId)
                .orElseThrow(NoteNotFoundException::new);

        Bookmark bookmark = bookmarkRepository.findByMemberAndNote(member, note)
                .orElseThrow(() -> new BadRequestException("Bookmark not found."));

        bookmarkRepository.delete(bookmark);
    }
} 