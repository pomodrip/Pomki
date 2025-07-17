package com.cooltomato.pomki.global.exception;

public class UnsupportedFormatException extends ImageException {
    
    public UnsupportedFormatException(String message) {
        super(message);
    }
    
    public UnsupportedFormatException(String message, Throwable cause) {
        super(message, cause);
    }
} 