package com.cooltomato.pomki.trash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrashResponseDto {
    private List<TrashItemDto> items;
    private int totalCount;
    private String message;
} 