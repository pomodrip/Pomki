package com.cooltomato.pomki.global.filter;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.cooltomato.pomki.auth.jwt.JwtProvider;
import com.cooltomato.pomki.auth.jwt.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtProvider tokenProvider;
    private static final List<String> allowUrlList=List.of("/h2-console","/api/auth/refresh","/api/members/register","/v3/api-docs","/api/auth/login","/api/members/check","/login","/favicon.ico","/api/auth/oauth2/login");
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        if(allowUrlList.contains(request.getRequestURI())){
            return true;
        }
        return false;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String accessToken = JwtUtil.resolveToken(request);

            if (StringUtils.hasText(accessToken)) {
                if (tokenProvider.validateToken(accessToken)) {
                    Authentication authentication = tokenProvider.getAuthentication(accessToken);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    String refreshToken = JwtUtil.extractRefreshToken(request);
                    if (StringUtils.hasText(refreshToken)) {
                        try {
                            String newAccessToken = tokenProvider.createAccessTokenFromRefreshToken(accessToken, refreshToken);
                            response.setHeader(JwtUtil.AUTHORIZATION_HEADER, JwtUtil.BEARER_PREFIX + newAccessToken);
                            Authentication authentication = tokenProvider.getAuthentication(newAccessToken);
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } catch (Exception e) {
                            log.debug("리프레시 토큰 재발급 실패", e);
                            SecurityContextHolder.clearContext();
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("JWT 처리 중 오류 발생", e);
            SecurityContextHolder.clearContext();
        }
        
        filterChain.doFilter(request, response);
    }
} 