package com.cooltomato.pomki.global.exception;

public class UploadFailedException extends ImageException {
    
    public UploadFailedException(String message) {
        super(message);
    }
    
    public UploadFailedException(String message, Throwable cause) {
        super(message, cause);
    }
} 