package com.cooltomato.pomki.notetag.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
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
    private String tagNames ;
    private Long memberId ;
}
