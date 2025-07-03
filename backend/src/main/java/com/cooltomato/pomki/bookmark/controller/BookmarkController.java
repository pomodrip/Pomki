package com.cooltomato.pomki.bookmark.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.dto.BookmarkDto;
import com.cooltomato.pomki.bookmark.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmark", description = "노트 북마크 관련 API")
public class BookmarkController {
    
    private final BookmarkService bookmarkService;

    @PostMapping("/notes/{noteId}")
    @Operation(summary = "노트 북마크 추가", description = "노트를 북마크에 추가합니다.")
    public ResponseEntity<Void> addNoteBookmark(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @PathVariable String noteId) {
        
        bookmarkService.addBookmark(principalMember.getMemberId(), noteId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notes/{noteId}")
    @Operation(summary = "노트 북마크 삭제", description = "노트를 북마크에서 삭제합니다.")
    public ResponseEntity<Void> removeNoteBookmark(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @PathVariable String noteId) {
        
        bookmarkService.removeBookmark(principalMember.getMemberId(), noteId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/notes")
    @Operation(summary = "노트 북마크 목록 조회", description = "사용자의 노트 북마크 목록을 조회합니다.")
    public ResponseEntity<List<BookmarkDto>> getNoteBookmarks(
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        List<BookmarkDto> bookmarks = bookmarkService.getBookmarks(principalMember.getMemberId());
        return ResponseEntity.ok(bookmarks);
    }

    @GetMapping("/notes/{noteId}/status")
    @Operation(summary = "노트 북마크 상태 확인", description = "특정 노트의 북마크 상태를 확인합니다.")
    public ResponseEntity<Boolean> isNoteBookmarked(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @PathVariable String noteId) {
        
        boolean isBookmarked = bookmarkService.isBookmarked(principalMember.getMemberId(), noteId);
        return ResponseEntity.ok(isBookmarked);
    }
} 