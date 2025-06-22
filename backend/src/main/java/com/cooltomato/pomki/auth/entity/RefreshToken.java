package com.cooltomato.pomki.auth.entity;

import lombok.*;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import jakarta.persistence.EntityListeners;

import org.springframework.data.redis.core.RedisHash;

@RedisHash("refreshToken")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RefreshToken {

    @Id
    private String refreshToken; 
    @Indexed
    private Long memberId;
    @CreatedDate
    private LocalDateTime createdAt;
    
    @TimeToLive
    private Long expiresAt;

    @Builder
    public RefreshToken(String refreshToken, Long memberId, LocalDateTime createdAt, Long expiresAt) {
        this.refreshToken = refreshToken;
        this.memberId = memberId;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }
    
} 