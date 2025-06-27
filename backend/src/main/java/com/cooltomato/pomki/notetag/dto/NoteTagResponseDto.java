package com.cooltomato.pomki.notetag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteTagResponseDto {
    private String noteId ;
    private String tagName ;
    private Long memberId ;
}
