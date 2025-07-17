package com.cooltomato.pomki.email.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import com.cooltomato.pomki.email.constant.EmailVerificationCode;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RedisHash("emailVerification")
@Getter
@Setter
@NoArgsConstructor
public class EmailVerification {
    
    @Id
    private String email;
    
    private String verificationCode;
    private EmailVerificationCode type;
    private boolean verified;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @TimeToLive
    private Long expiresAt;
    
    @Builder
    public EmailVerification(String email, String verificationCode, EmailVerificationCode type, boolean verified, 
                           LocalDateTime createdAt, Long expiresAt) {
        this.email = email;
        this.verificationCode = verificationCode;
        this.type = type;
        this.verified = verified;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt != null ? expiresAt : 240L;
    }
    

} 