package com.cooltomato.pomki.global.exception;

public class EmptyFileException extends ImageException {
    
    public EmptyFileException(String message) {
        super(message);
    }
    
    public EmptyFileException(String message, Throwable cause) {
        super(message, cause);
    }
} 