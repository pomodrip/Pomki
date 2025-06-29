package com.cooltomato.pomki.notification.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class NotificationOption {
    
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
    
    public static NotificationOption empty() {
        return NotificationOption.builder().build();
    }
    
    public static NotificationOption withData(Map<String, String> data) {
        return NotificationOption.builder()
                .data(data)
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