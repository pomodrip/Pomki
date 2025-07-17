package com.cooltomato.pomki.auth.jwt;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

public class JwtUtil {

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    
    // 토큰 만료 시간 상수
    public static final long ACCESS_TOKEN_EXPIRE_TIME = 60 * 10; // 10분
    public static final long REFRESH_TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 3; // 3일

    public static String resolveToken(String authorization) {
        String bearer = authorization;
        if (bearer != null && bearer.startsWith(BEARER_PREFIX)) {
            return bearer.substring(BEARER_PREFIX.length());
        }
        return "";
    }

    public static String extractRefreshToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    
    public static long getAccessTokenExpireTime() {
        return ACCESS_TOKEN_EXPIRE_TIME;
    }
    
    public static long getRefreshTokenExpireTime() {
        return REFRESH_TOKEN_EXPIRE_TIME;
    }
    
    public static int getRefreshTokenExpireTimeForCookie() {
        return (int) (REFRESH_TOKEN_EXPIRE_TIME >= Integer.MAX_VALUE ? 60 * 60 * 24 * 365 : REFRESH_TOKEN_EXPIRE_TIME);
    }
} 