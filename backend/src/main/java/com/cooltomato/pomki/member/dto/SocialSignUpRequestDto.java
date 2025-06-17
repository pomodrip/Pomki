package com.cooltomato.pomki.member.dto;

import com.cooltomato.pomki.global.constant.AuthType;
import lombok.Builder;
import lombok.Getter;

@Getter
public class SocialSignUpRequestDto {
    private final String nickname;
    private final String email;
    private final AuthType provider;
    private final String providerId;

    @Builder
    public SocialSignUpRequestDto(String nickname, String email, AuthType provider, String providerId) {
        this.nickname = nickname;
        this.email = email;
        this.provider = provider;
        this.providerId = providerId;
    }
} 