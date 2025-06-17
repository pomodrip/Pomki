package com.cooltomato.pomki.auth.dto;

import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.global.constant.Role;
import com.cooltomato.pomki.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
public class MemberInfoDto {
    private final Long memberId;
    private final String email;
    private final String password;
    private final Role roles;
    private final boolean isDeleted;
    private final String providerUserId;
    private final AuthType provider;
    private final boolean isSocialLogin;

    @Builder
    public MemberInfoDto(Long memberId, String email, String password, Role roles, boolean isDeleted, String providerUserId, AuthType provider, boolean isSocialLogin) {
        this.memberId = memberId;
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.isDeleted = isDeleted;
        this.providerUserId = providerUserId;
        this.provider = provider;
        this.isSocialLogin = isSocialLogin;
    }

    public static MemberInfoDto from(Member member) {
        return MemberInfoDto.builder()
                .memberId(member.getMemberId())
                .email(member.getMemberEmail())
                .password(member.getMemberPassword())
                .roles(member.getMemberRoles())
                .isDeleted(member.isDeleted())
                .providerUserId(member.getProviderUserId())
                .provider(member.getProvider())
                .isSocialLogin(member.isSocialLogin())
                .build();
    }
} 