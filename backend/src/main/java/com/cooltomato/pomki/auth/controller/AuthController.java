package com.cooltomato.pomki.auth.controller;

import com.cooltomato.pomki.auth.dto.AccessTokenResponseDto;
import com.cooltomato.pomki.auth.dto.LoginRequestDto;
import com.cooltomato.pomki.auth.dto.TokenResponseDto;
import com.cooltomato.pomki.auth.jwt.JwtUtil;
import com.cooltomato.pomki.auth.service.AuthService;
import com.cooltomato.pomki.member.dto.MemberSignUpRequestDto;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Parameter;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AccessTokenResponseDto> login(@Valid @RequestBody LoginRequestDto request, HttpServletResponse response) {
        TokenResponseDto tokenDto = authService.login(request);

        Cookie cookie = new Cookie("refresh_token", tokenDto.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(true);

        response.addCookie(cookie);

        return ResponseEntity.ok(AccessTokenResponseDto.builder()
                .accessToken(tokenDto.getAccessToken())
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponseDto> refresh(
        @Parameter(hidden = true) @CookieValue(name = "refresh_token",required = true) String refreshToken,
        @Parameter(hidden = true) @RequestHeader(name = "Authorization",required = false) String authorization
    ) {
        String accessToken = JwtUtil.resolveToken(authorization);
        if(!StringUtils.hasText(accessToken)) {
            return ResponseEntity.ok(authService.refresh(refreshToken));
        }

        AccessTokenResponseDto newAccessToken = authService.refresh(refreshToken,accessToken);
        return ResponseEntity.ok(newAccessToken);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Parameter(hidden = true) @CookieValue(name = "refresh_token") String refreshToken, HttpServletResponse response) {
        authService.logout(refreshToken);

        Cookie cookie = new Cookie("refresh_token", null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }
} 