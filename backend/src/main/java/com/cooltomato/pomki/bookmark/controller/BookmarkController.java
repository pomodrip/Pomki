package com.cooltomato.pomki.bookmark.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.dto.BookmarkDto;
import com.cooltomato.pomki.note.dto.NoteResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import com.cooltomato.pomki.bookmark.service.BookmarkService;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {
    private final BookmarkService bookmarkService;

    @PostMapping
    public ResponseEntity<Void> createBookmark(@RequestBody BookmarkDto bookmarkDto,
                                               @AuthenticationPrincipal PrincipalMember principalMember) {
        bookmarkService.createBookmark(bookmarkDto.getNoteId(), principalMember);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<NoteResponseDto>> getBookmarks(@AuthenticationPrincipal PrincipalMember principalMember) {
        List<NoteResponseDto> bookmarks = bookmarkService.getBookmarks(principalMember);
        return ResponseEntity.ok(bookmarks);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteBookmark(@PathVariable String noteId,
                                               @AuthenticationPrincipal PrincipalMember principalMember) {
        bookmarkService.deleteBookmark(noteId, principalMember);
        return ResponseEntity.ok().build();
    }
} 