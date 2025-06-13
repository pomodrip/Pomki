package com.cooltomato.pomki.note.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteRequestDto {
    private String noteId;
    private String noteTitle;
    private String noteContent;
    private Boolean aiEnhanced;
    private String originalContent;
} 