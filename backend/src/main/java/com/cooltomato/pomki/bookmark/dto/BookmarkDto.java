package com.cooltomato.pomki.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDto {
    private String noteId;
    private String noteTitle;
    private String noteContent;
    private LocalDateTime createdAt;
} 