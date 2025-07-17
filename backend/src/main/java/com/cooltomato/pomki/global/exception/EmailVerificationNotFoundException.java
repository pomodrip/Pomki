package com.cooltomato.pomki.global.exception;

public class EmailVerificationNotFoundException extends RuntimeException {
    public EmailVerificationNotFoundException(String message) {
        super(message);
    }
    
    public EmailVerificationNotFoundException() {
        super("해당 이메일의 인증 요청을 찾을 수 없습니다.");
    }
} 