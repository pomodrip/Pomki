package com.cooltomato.pomki.bookmark.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.dto.CardBookmarkDto;
import com.cooltomato.pomki.bookmark.service.CardBookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/card-bookmarks")
@RequiredArgsConstructor
@Tag(name = "Card Bookmark", description = "카드 북마크 관련 API")
public class CardBookmarkController {

    private final CardBookmarkService cardBookmarkService;

    @Operation(summary = "카드 북마크 추가", description = "카드를 북마크에 추가합니다.")
    @PostMapping("/{cardId}")
    public ResponseEntity<Void> addCardBookmark(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @PathVariable(name = "cardId") Long cardId) {
        
        cardBookmarkService.addCardBookmark(principalMember.getMemberId(), cardId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카드 북마크 삭제", description = "카드를 북마크에서 삭제합니다.")
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> removeCardBookmark(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @PathVariable(name = "cardId") Long cardId) {
        
        cardBookmarkService.removeCardBookmark(principalMember.getMemberId(), cardId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "카드 북마크 목록 조회", description = "사용자의 카드 북마크 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<CardBookmarkDto>> getCardBookmarks(
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        List<CardBookmarkDto> bookmarks = cardBookmarkService.getCardBookmarks(principalMember.getMemberId());
        return ResponseEntity.ok(bookmarks);
    }

    @Operation(summary = "카드 북마크 상태 확인", description = "특정 카드의 북마크 상태를 확인합니다.")
    @GetMapping("/{cardId}/status")
    public ResponseEntity<Boolean> isCardBookmarked(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @PathVariable(name = "cardId") Long cardId) {
        
        boolean isBookmarked = cardBookmarkService.isCardBookmarked(principalMember.getMemberId(), cardId);
        return ResponseEntity.ok(isBookmarked);
    }
} 