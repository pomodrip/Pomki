package com.cooltomato.pomki.global.exception;

public class MemberNotFoundException extends RuntimeException {
    public MemberNotFoundException(String message) {
        super(message);
    }
    
    public MemberNotFoundException() {
        super("존재하지 않는 사용자입니다.");
    }
} 