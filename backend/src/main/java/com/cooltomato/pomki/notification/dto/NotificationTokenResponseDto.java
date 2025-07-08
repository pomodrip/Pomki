package com.cooltomato.pomki.notification.dto;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationTokenResponseDto {
    private final String firebaseToken;
    private final FireBasePlatform platform;
    private final LocalDateTime createdAt;
    private final Long memberId;
    private final String memberName;
} 