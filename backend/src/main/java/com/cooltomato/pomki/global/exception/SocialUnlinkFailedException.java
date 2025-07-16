package com.cooltomato.pomki.global.exception;

public class SocialUnlinkFailedException extends RuntimeException {
    public SocialUnlinkFailedException(String message) {
        super(message);
    }

    public SocialUnlinkFailedException(String message, Throwable cause) {
        super(message, cause);
    }
} 