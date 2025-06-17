package com.cooltomato.pomki.auth.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
public class PrincipalMember implements UserDetails, OAuth2User {

    private final MemberInfoDto memberInfo;
    private Map<String, Object> attributes;

    @Builder
    public PrincipalMember(MemberInfoDto memberInfo, Map<String, Object> attributes) {
        this.memberInfo = memberInfo;
        this.attributes = attributes;
    }

    // UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // return Arrays.stream(memberInfo.getRoles().split(","))
        // .map(SimpleGrantedAuthority::new)
        // .collect(Collectors.toList());
        return List.of(new SimpleGrantedAuthority(memberInfo.getRoles().getName()));
    }

    @Override
    public String getPassword() {
        return memberInfo.getPassword();
    }

    @Override
    public String getUsername() {
        return memberInfo.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return !memberInfo.isDeleted();
    }

    // OAuth2User
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return String.valueOf(memberInfo.getMemberId());
    }

    public Long getMemberId() {
        return memberInfo.getMemberId();
    }

    public MemberInfoDto getMemberInfo() {
        return memberInfo;
    }

    public String getEmail() {
        return memberInfo.getEmail();
    }

    public boolean isSocialUser() {
        return memberInfo.isSocialLogin();
    }
} 