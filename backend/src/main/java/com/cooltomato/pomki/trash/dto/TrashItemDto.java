package com.cooltomato.pomki.trash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrashItemDto {
    private String trashId;
    private String itemId;
    private String itemType; // DECK, CARD, NOTE
    private String itemTitle;
    private String itemContent;
    private LocalDateTime deletedAt;
} 