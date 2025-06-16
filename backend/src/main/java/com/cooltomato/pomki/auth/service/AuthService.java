package com.cooltomato.pomki.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.auth.dto.LoginRequestDto;
import com.cooltomato.pomki.auth.dto.TokenResponseDto;
import com.cooltomato.pomki.auth.dto.MemberInfoDto;
import com.cooltomato.pomki.auth.entity.RefreshToken;
import com.cooltomato.pomki.auth.jwt.JwtProvider;
import com.cooltomato.pomki.auth.repository.RefreshTokenRepository;
import com.cooltomato.pomki.member.dto.MemberSignUpRequestDto;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.member.service.MemberService;
import com.cooltomato.pomki.auth.dto.AccessTokenResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final MemberService memberService;

    @Transactional
    public void signUp(MemberSignUpRequestDto request) {
        memberService.signUp(request);
    }

    @Transactional
    public TokenResponseDto login(LoginRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Member member = memberRepository.findByMemberEmail(request.getEmail()).orElseThrow();
        MemberInfoDto memberInfo = MemberInfoDto.builder()
                .id(member.getMemberId())
                .email(member.getMemberEmail())
                .roles(member.getMemberRoles())
                .isSocialLogin(member.isSocialLogin())
                .provider(member.getProvider())
                .build();
        return tokenProvider.createAndSaveTokens(memberInfo);
    }

    @Transactional
    public AccessTokenResponseDto refresh(String refreshToken) {
        tokenProvider.validateToken(refreshToken);

        refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 RefreshToken 입니다."));

        Authentication authentication = tokenProvider.getAuthentication(refreshToken);
        String newAccessToken = tokenProvider.createAccessTokenFromAuthentication(authentication);

        return new AccessTokenResponseDto(newAccessToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.deleteById(refreshToken);
    }

    @Transactional
    public AccessTokenResponseDto reissue(String refreshToken) {
        tokenProvider.validateToken(refreshToken);

        refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 RefreshToken 입니다."));

        Authentication authentication = tokenProvider.getAuthentication(refreshToken);
        String newAccessToken = tokenProvider.createAccessTokenFromAuthentication(authentication);

        return new AccessTokenResponseDto(newAccessToken);
    }
}