package com.cooltomato.pomki.global.constant;

import lombok.Getter;

@Getter
public enum FireBasePlatform {
    ANDROID("android"),
    IOS("apns"),
    WEB("webpush"),
    UNKNOWN("unknown");

    private final String platformOptionName;
    
    FireBasePlatform(String platformOptionName) {
        this.platformOptionName = platformOptionName;
    }
}
