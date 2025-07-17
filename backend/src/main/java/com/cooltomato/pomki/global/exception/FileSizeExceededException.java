package com.cooltomato.pomki.global.exception;

public class FileSizeExceededException extends ImageException {
    
    public FileSizeExceededException(String message) {
        super(message);
    }
    
    public FileSizeExceededException(String message, Throwable cause) {
        super(message, cause);
    }
} 