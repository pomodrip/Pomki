package com.cooltomato.pomki.global.exception;

public class AlreadyBookmarkedException extends RuntimeException {
    public AlreadyBookmarkedException(String message) {
        super(message);
    }
} 