package com.cooltomato.pomki.global.constant;

import lombok.Getter;

@Getter
public enum AuthType {
    LOCAL("local"), KAKAO("kakao"), NAVER("naver"), GOOGLE("google");
    private AuthType(String provider) {
        this.provider = provider;
    }

    private final String provider;
} 