package com.cooltomato.pomki.global.exception;

public class S3OperationFailedException extends ImageException {
    
    public S3OperationFailedException(String message) {
        super(message);
    }
    
    public S3OperationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
} 