package com.cooltomato.pomki.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
public class NotificationOption {
    
    private final NotificationMessageType messageType;
    
    private final String imageUrl;
    private final String clickAction;
    private final Map<String, String> data;
    
    private final String channelId;
    private final String groupKey;
    private final String priority;
    private final Long ttl;
    private final String sound;
    private final String color;
    
    private final Integer badge;
    private final String category;
    private final Boolean mutableContent;
    private final Boolean contentAvailable;
    
    private final String icon;
    private final String urgency;
    private final Map<String, String> headers;
    private final Boolean requireInteraction;
    private final Boolean silent;
    
    @Builder
    public NotificationOption(NotificationMessageType messageType, 
                             String imageUrl, String clickAction, Map<String, String> data,
                             String channelId, String groupKey, String priority, Long ttl, String sound, String color,
                             Integer badge, String category, Boolean mutableContent, Boolean contentAvailable,
                             String icon, String urgency, Map<String, String> headers, 
                             Boolean requireInteraction, Boolean silent) {
        this.messageType = messageType != null ? messageType : NotificationMessageType.DATA_ONLY;
        this.imageUrl = imageUrl;
        this.clickAction = clickAction;
        this.data = data;
        this.channelId = channelId;
        this.groupKey = groupKey;
        this.priority = priority;
        this.ttl = ttl;
        this.sound = sound;
        this.color = color;
        this.badge = badge;
        this.category = category;
        this.mutableContent = mutableContent;
        this.contentAvailable = contentAvailable;
        this.icon = icon;
        this.urgency = urgency;
        this.headers = headers;
        this.requireInteraction = requireInteraction;
        this.silent = silent;
    }
    
    public static NotificationOption empty() {
        return NotificationOption.builder().build();
    }
    
    public static NotificationOption withData(Map<String, String> data) {
        return NotificationOption.builder()
                .data(data)
                .build();
    }
    
    public static NotificationOption dataOnly() {
        return NotificationOption.builder()
                .messageType(NotificationMessageType.DATA_ONLY)
                .build();
    }
    
    public static NotificationOption dataOnlyWithData(Map<String, String> data) {
        return NotificationOption.builder()
                .messageType(NotificationMessageType.DATA_ONLY)
                .data(data)
                .build();
    }
    
    public static NotificationOption notificationOnly() {
        return NotificationOption.builder()
                .messageType(NotificationMessageType.NOTIFICATION_ONLY)
                .build();
    }
    
    public static NotificationOption notificationOnlyWithImage(String imageUrl) {
        return NotificationOption.builder()
                .messageType(NotificationMessageType.NOTIFICATION_ONLY)
                .imageUrl(imageUrl)
                .build();
    }
    
    public static NotificationOption both() {
        return NotificationOption.builder()
                .messageType(NotificationMessageType.BOTH)
                .build();
    }
    
    public static NotificationOption withImageAndAction(String imageUrl, String clickAction) {
        return NotificationOption.builder()
                .imageUrl(imageUrl)
                .clickAction(clickAction)
                .build();
    }
    
    public static NotificationOption androidHighPriority() {
        return NotificationOption.builder()
                .priority("high")
                .build();
    }
    
    public static NotificationOption withAndroidChannel(String channelId) {
        return NotificationOption.builder()
                .channelId(channelId)
                .build();
    }
    
    public static NotificationOption withIosBadge(Integer badge) {
        return NotificationOption.builder()
                .badge(badge)
                .build();
    }
    
    public static NotificationOption webHighUrgency() {
        return NotificationOption.builder()
                .urgency("high")
                .build();
    }
} 