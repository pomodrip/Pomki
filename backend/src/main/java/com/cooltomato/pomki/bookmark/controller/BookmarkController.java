package com.cooltomato.pomki.bookmark.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.bookmark.dto.BookmarkRequestDto;
import com.cooltomato.pomki.bookmark.dto.BookmarkResponseDto;
import com.cooltomato.pomki.bookmark.service.BookmarkService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService service;

    // 북마크 지정
    @PostMapping
    public ResponseEntity<BookmarkResponseDto> createBookmark(@AuthenticationPrincipal PrincipalMember principal, @RequestBody BookmarkRequestDto requestDto) {
        BookmarkResponseDto response = service.createBookmarkService(principal, requestDto);
        return ResponseEntity.ok(response);
    }
    
    
} 