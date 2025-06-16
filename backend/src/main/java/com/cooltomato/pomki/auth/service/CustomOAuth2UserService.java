package com.cooltomato.pomki.auth.service;

import java.util.Optional;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
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

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2UserInfo userInfo = getOAuth2UserInfo(registrationId, oAuth2User);

        AuthType provider = AuthType.valueOf(userInfo.getProvider().toUpperCase());
        String providerUserId = userInfo.getProviderId();
        String email = userInfo.getEmail();
        String name = userInfo.getName();

        Optional<Member> member = memberRepository.findByProviderAndProviderUserId(provider, providerUserId);
        if(member.isEmpty()){
            Member newMember=Member.builder()
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
                .memberInfo(MemberInfoDto.from(member.get()))
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