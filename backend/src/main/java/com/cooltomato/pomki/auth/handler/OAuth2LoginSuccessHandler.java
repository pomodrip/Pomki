package com.cooltomato.pomki.auth.handler;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.auth.dto.TokenResponseDto;
import com.cooltomato.pomki.auth.dto.MemberInfoDto;
import com.cooltomato.pomki.auth.jwt.JwtProvider;
import com.cooltomato.pomki.global.exception.MemberNotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider tokenProvider;
    private final MemberRepository memberRepository;

    @Value("${pomki.frontend.base-url}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        log.info("OAuth2 Login 성공");
        try {
            PrincipalMember principal = (PrincipalMember) authentication.getPrincipal();
            Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(principal.getMemberId())
                    .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));

            MemberInfoDto memberInfo = MemberInfoDto.builder()
                    .memberId(member.getMemberId())
                    .email(member.getMemberEmail())
                    .roles(member.getMemberRoles())
                    .isSocialLogin(member.isSocialLogin())
                    .provider(member.getProvider())
                    .build();
            TokenResponseDto tokenDto = tokenProvider.createAndSaveTokens(memberInfo);

            setRefreshTokenCookie(response, tokenDto.getRefreshToken());

            UriComponents uriComponent = UriComponentsBuilder.fromUriString(frontendBaseUrl + "/auth/login")
                    .queryParam("accessToken", tokenDto.getAccessToken())
                    // 나중에 리프레시 쿠키 문제있으면 추가
                    // .queryParam("refreshToken", tokenDto.getRefreshToken())
                    .queryParam("resultCode", 200)
                    .encode()
                    .build();
            log.debug("토큰 :{}",tokenDto.getAccessToken());
            getRedirectStrategy().sendRedirect(request, response, uriComponent.toString());
        } catch (Exception e) {
            log.error("OAuth2 로그인 성공 후 처리 중 에러 발생", e);
            throw e;
        }
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .domain(URI.create(frontendBaseUrl).getHost())
                .maxAge(tokenProvider.getRefreshTokenExpireTime())
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
} 