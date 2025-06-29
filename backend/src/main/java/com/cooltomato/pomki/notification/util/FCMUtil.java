package com.cooltomato.pomki.notification.util;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import com.cooltomato.pomki.notification.dto.NotificationRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationOption;
import com.google.firebase.messaging.*;
import org.springframework.util.StringUtils;

import java.util.List;

public final class FCMUtil {

    private FCMUtil() {}

    /**
     * 단일 토큰용 메시지 생성
     */
    public static Message buildMessage(String token, NotificationRequestDto request, FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        
        Message.Builder messageBuilder = Message.builder()
                .setToken(token)
                .setNotification(buildNotification(request));

        addPlatformSpecificConfig(messageBuilder, request, platform);
        
        if (option != null && option.getData() != null && !option.getData().isEmpty()) {
            messageBuilder.putAllData(option.getData());
        }

        return messageBuilder.build();
    }

    /**
     * 멀티캐스트용 메시지 생성
     */
    public static MulticastMessage buildMulticastMessage(List<String> tokens, 
                                                        NotificationRequestDto request, 
                                                        FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        
        MulticastMessage.Builder messageBuilder = MulticastMessage.builder()
                .addAllTokens(tokens)
                .setNotification(buildNotification(request));

        addPlatformSpecificConfigForMulticast(messageBuilder, request, platform);
        
        if (option != null && option.getData() != null && !option.getData().isEmpty()) {
            messageBuilder.putAllData(option.getData());
        }

        return messageBuilder.build();
    }

    /**
     * 토픽용 메시지 생성
     */
    public static Message buildTopicMessage(String topic, NotificationRequestDto request, FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        
        Message.Builder messageBuilder = Message.builder()
                .setTopic(topic)
                .setNotification(buildNotification(request));

        addPlatformSpecificConfig(messageBuilder, request, platform);
        
        if (option != null && option.getData() != null && !option.getData().isEmpty()) {
            messageBuilder.putAllData(option.getData());
        }

        return messageBuilder.build();
    }

    /**
     * 공통 알림 빌드
     */
    private static Notification buildNotification(NotificationRequestDto request) {
        NotificationOption option = request.getOption();
        
        return Notification.builder()
                .setTitle(request.getTitle())
                .setBody(request.getBody())
                .setImage(option != null && StringUtils.hasText(option.getImageUrl()) ? option.getImageUrl() : null)
                .build();
    }

    /**
     * 단일 메시지용 플랫폼별 설정
     */
    private static void addPlatformSpecificConfig(Message.Builder messageBuilder, 
                                                 NotificationRequestDto request, 
                                                 FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        if (option == null) return;

        switch (platform) {
            case ANDROID:
                messageBuilder.setAndroidConfig(buildAndroidConfig(request, option));
                break;
            case IOS:
                messageBuilder.setApnsConfig(buildApnsConfig(request, option));
                break;
            case WEB:
                messageBuilder.setWebpushConfig(buildWebpushConfig(request, option));
                break;
        }
    }

    /**
     * 멀티캐스트용 플랫폼별 설정
     */
    private static void addPlatformSpecificConfigForMulticast(MulticastMessage.Builder messageBuilder, 
                                                              NotificationRequestDto request, 
                                                              FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        if (option == null) return;

        switch (platform) {
            case ANDROID:
                messageBuilder.setAndroidConfig(buildAndroidConfig(request, option));
                break;
            case IOS:
                messageBuilder.setApnsConfig(buildApnsConfig(request, option));
                break;
            case WEB:
                messageBuilder.setWebpushConfig(buildWebpushConfig(request, option));
                break;
        }
    }

    private static AndroidConfig buildAndroidConfig(NotificationRequestDto request, NotificationOption option) {
        AndroidNotification androidNotification = AndroidNotification.builder()
                .setClickAction(StringUtils.hasText(option.getClickAction()) ? option.getClickAction() : null)
                .setChannelId(StringUtils.hasText(option.getChannelId()) ? option.getChannelId() : null)
                .setTag(StringUtils.hasText(option.getGroupKey()) ? option.getGroupKey() : null)
                .setImage(StringUtils.hasText(option.getImageUrl()) ? option.getImageUrl() : null)
                .setSound(StringUtils.hasText(option.getSound()) ? option.getSound() : null)
                .setColor(StringUtils.hasText(option.getColor()) ? option.getColor() : null)
                .build();

        return AndroidConfig.builder()
                .setTtl(option.getTtl() != null ? option.getTtl() * 1000L : null)
                .setPriority(StringUtils.hasText(option.getPriority()) && "high".equalsIgnoreCase(option.getPriority()) 
                    ? AndroidConfig.Priority.HIGH : AndroidConfig.Priority.NORMAL)
                .setNotification(androidNotification)
                .build();
    }

    /**
     * iOS 전용 설정 (APNs)
     */
    private static ApnsConfig buildApnsConfig(NotificationRequestDto request, NotificationOption option) {
        Aps aps = Aps.builder()
                .setBadge(option.getBadge())
                .setSound(StringUtils.hasText(option.getSound()) ? option.getSound() : "default")
                .setCategory(StringUtils.hasText(option.getCategory()) ? option.getCategory() : 
                           StringUtils.hasText(option.getClickAction()) ? option.getClickAction() : null)
                .setMutableContent(option.getMutableContent() != null && option.getMutableContent() ? true : null)
                .setContentAvailable(option.getContentAvailable() != null && option.getContentAvailable() ? true : null)
                .build();

        return ApnsConfig.builder()
                .setAps(aps)
                .build();
    }

    /**
     * Web 전용 설정 (WebPush)
     */
    private static WebpushConfig buildWebpushConfig(NotificationRequestDto request, NotificationOption option) {
        WebpushConfig.Builder webpushBuilder = WebpushConfig.builder();
        
        if (option.getTtl() != null) {
            webpushBuilder.putHeader("TTL", String.valueOf(option.getTtl()));
        }
        if (StringUtils.hasText(option.getUrgency())) {
            webpushBuilder.putHeader("Urgency", option.getUrgency());
        }
        if (option.getHeaders() != null && !option.getHeaders().isEmpty()) {
            option.getHeaders().forEach(webpushBuilder::putHeader);
        }
        
        return webpushBuilder
                .setFcmOptions(StringUtils.hasText(option.getClickAction()) ? 
                    WebpushFcmOptions.builder().setLink(option.getClickAction()).build() : null)
                .build();
    }
} 