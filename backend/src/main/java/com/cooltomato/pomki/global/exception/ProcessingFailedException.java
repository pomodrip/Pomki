package com.cooltomato.pomki.global.exception;

public class ProcessingFailedException extends ImageException {
    
    public ProcessingFailedException(String message) {
        super(message);
    }
    
    public ProcessingFailedException(String message, Throwable cause) {
        super(message, cause);
    }
} 