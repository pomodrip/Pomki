package com.cooltomato.pomki.auth.dto;

public interface OAuth2UserInfo {
    String getProvider();
    String getProviderId();
    String getEmail();
    String getName();
} 