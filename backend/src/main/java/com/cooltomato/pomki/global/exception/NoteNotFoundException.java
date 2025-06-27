package com.cooltomato.pomki.global.exception;

public class NoteNotFoundException extends RuntimeException {
    public NoteNotFoundException(String message) {
        super(message);
    }
    
    public NoteNotFoundException() {
        super("해당 ID의 노트를 찾을 수 없습니다.");
    }
} 