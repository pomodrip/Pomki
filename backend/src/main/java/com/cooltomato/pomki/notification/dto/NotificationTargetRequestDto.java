package com.cooltomato.pomki.notification.dto;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTargetRequestDto {
    
    @NotBlank(message = "토큰은 필수입니다")
    private String token;

    @NotNull(message = "플랫폼 정보는 필수입니다")
    private FireBasePlatform platform;
    
    @NotNull(message = "알림 정보는 필수입니다")
    @Valid
    private NotificationRequestDto notification;
    
} 