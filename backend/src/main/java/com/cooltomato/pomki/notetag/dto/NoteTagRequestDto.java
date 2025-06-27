package com.cooltomato.pomki.notetag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoteTagRequestDto {
    private String tagName ;
    private String noteId ;
}
