package com.cooltomato.pomki.member.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class MemberUpdateResponseDto {
    
    private Long memberId;
    private String memberEmail;
    private String currentEmail;
    private String memberNickname;
    private boolean isSocialLogin;
    private LocalDateTime updatedAt;
    
    @Builder
    public MemberUpdateResponseDto(Long memberId, String memberEmail, String currentEmail,
                                  String memberNickname, boolean isSocialLogin, 
                                  LocalDateTime updatedAt) {
        this.memberId = memberId;
        this.memberEmail = memberEmail;
        this.currentEmail = currentEmail;
        this.memberNickname = memberNickname;
        this.isSocialLogin = isSocialLogin;
        this.updatedAt = updatedAt;
    }
} 