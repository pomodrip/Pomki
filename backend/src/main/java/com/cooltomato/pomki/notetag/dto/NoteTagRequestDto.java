package com.cooltomato.pomki.notetag.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NoteTagRequestDto {
    private List<String> tagNames ;
    private String noteId ;
}
