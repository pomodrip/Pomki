package com.cooltomato.pomki.auth.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cooltomato.pomki.auth.dto.GoogleOAuth2UserInfo;
import com.cooltomato.pomki.auth.dto.KakaoOAuth2UserInfo;
import com.cooltomato.pomki.auth.dto.MemberInfoDto;
import com.cooltomato.pomki.auth.dto.OAuth2UserInfo;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.global.constant.Role;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2AccessToken accessToken = userRequest.getAccessToken();

        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User);

        AuthType provider = AuthType.valueOf(userInfo.getProvider().toUpperCase());
        String providerUserId = userInfo.getProviderId();
        String email = userInfo.getEmail();
        String name = userInfo.getName();

        String redisKeyAccessToken = "social:accessToken:" + provider.name() + ":" + providerUserId;
        
        Instant expiresAt = accessToken.getExpiresAt();
        if (expiresAt != null) {
            Duration duration = Duration.between(Instant.now(), expiresAt);
            redisTemplate.opsForValue().set(redisKeyAccessToken, accessToken.getTokenValue(), duration.toSeconds(), TimeUnit.SECONDS);
        } else {
            redisTemplate.opsForValue().set(redisKeyAccessToken, accessToken.getTokenValue(), 3, TimeUnit.HOURS);
        }

        Optional<Member> memberOptional = memberRepository.findByProviderAndProviderUserIdAndIsDeletedIsFalse(provider, providerUserId);

        if (memberOptional.isEmpty()) {
            // 탈퇴한 회원인지 확인
            if (memberRepository.findByProviderAndProviderUserId(provider, providerUserId).isPresent()) {
                OAuth2Error error = new OAuth2Error("DELETED_USER_ACCOUNT", "This account has been deleted.", null);
                throw new OAuth2AuthenticationException(error, error.getErrorCode());
            }
            
            Member newMember = Member.builder()
                .memberEmail(email)
                .currentEmail(email)
                .memberNickname(name)
                .memberRoles(Role.USER)
                .isSocialLogin(true)
                .emailVerified(StringUtils.hasText(email)?true:false)
                .provider(provider)
                .providerUserId(providerUserId)
                .build();
            memberRepository.save(newMember);

            return PrincipalMember.builder()
                .memberInfo(MemberInfoDto.from(newMember))
                .attributes(oAuth2User.getAttributes())
                .build();
        }
        
        return PrincipalMember.builder()
                .memberInfo(MemberInfoDto.from(memberOptional.get()))
                .attributes(oAuth2User.getAttributes())
                .build();
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, OAuth2User oAuth2User) {
        if (registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(oAuth2User.getAttributes());
        } else if (registrationId.equalsIgnoreCase("kakao")) {
            return new KakaoOAuth2UserInfo(oAuth2User.getAttributes());
        }
        throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
    }
} 