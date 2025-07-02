package com.cooltomato.pomki.notification.util;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import com.cooltomato.pomki.notification.dto.NotificationMessageType;
import com.cooltomato.pomki.notification.dto.NotificationRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationOption;
import com.google.firebase.messaging.*;
import org.springframework.util.StringUtils;
import org.springframework.util.CollectionUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class FCMUtil {

    private FCMUtil() {}

    /**
     * 단일 토큰용 메시지 생성
     */
    public static Message buildMessage(String token, NotificationRequestDto request, FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        NotificationMessageType messageType = getMessageType(option);
        
        Message.Builder messageBuilder = Message.builder().setToken(token);

        switch (messageType) {
            case DATA_ONLY:
                messageBuilder.putAllData(buildDataWithTitleBody(request, option));
                break;
            case NOTIFICATION_ONLY:
                messageBuilder.setNotification(buildNotification(request));
                break;
            case BOTH:
                messageBuilder.setNotification(buildNotification(request));
                if (!CollectionUtils.isEmpty(getDataMap(option))) {
                    messageBuilder.putAllData(getDataMap(option));
                }
                break;
        }

        addPlatformSpecificConfig(messageBuilder, request, platform);
        return messageBuilder.build();
    }

    /**
     * 멀티캐스트용 메시지 생성
     */
    public static MulticastMessage buildMulticastMessage(List<String> tokens, 
                                                        NotificationRequestDto request, 
                                                        FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        NotificationMessageType messageType = getMessageType(option);
        
        MulticastMessage.Builder messageBuilder = MulticastMessage.builder().addAllTokens(tokens);

        switch (messageType) {
            case DATA_ONLY:
                messageBuilder.putAllData(buildDataWithTitleBody(request, option));
                break;
            case NOTIFICATION_ONLY:
                messageBuilder.setNotification(buildNotification(request));
                break;
            case BOTH:
                messageBuilder.setNotification(buildNotification(request));
                if (!CollectionUtils.isEmpty(getDataMap(option))) {
                    messageBuilder.putAllData(getDataMap(option));
                }
                break;
        }

        addPlatformSpecificConfigForMulticast(messageBuilder, request, platform);
        return messageBuilder.build();
    }

    /**
     * 토픽용 메시지 생성
     */
    public static Message buildTopicMessage(String topic, NotificationRequestDto request, FireBasePlatform platform) {
        NotificationOption option = request.getOption();
        NotificationMessageType messageType = getMessageType(option);
        
        Message.Builder messageBuilder = Message.builder().setTopic(topic);

        switch (messageType) {
            case DATA_ONLY:
                messageBuilder.putAllData(buildDataWithTitleBody(request, option));
                break;
            case NOTIFICATION_ONLY:
                messageBuilder.setNotification(buildNotification(request));
                break;
            case BOTH:
                messageBuilder.setNotification(buildNotification(request));
                if (!CollectionUtils.isEmpty(getDataMap(option))) {
                    messageBuilder.putAllData(getDataMap(option));
                }
                break;
        }

        addPlatformSpecificConfig(messageBuilder, request, platform);
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

    private static Map<String, String> buildDataWithTitleBody(NotificationRequestDto request, NotificationOption option) {
        Map<String, String> data = new HashMap<>();
        data.put("title", request.getTitle());
        data.put("body", request.getBody());
        
        if (!CollectionUtils.isEmpty(getDataMap(option))) {
            data.putAll(getDataMap(option));
        }
        
        return data;
    }
    
    private static NotificationMessageType getMessageType(NotificationOption option) {
        return option != null && option.getMessageType() != null ? 
               option.getMessageType() : NotificationMessageType.DATA_ONLY;
    }
    
    private static Map<String, String> getDataMap(NotificationOption option) {
        return option != null ? option.getData() : null;
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