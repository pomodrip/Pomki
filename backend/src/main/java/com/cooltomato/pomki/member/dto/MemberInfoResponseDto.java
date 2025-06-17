package com.cooltomato.pomki.member.dto;

import com.cooltomato.pomki.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

@Getter
public class MemberInfoResponseDto {
    private final String email;
    private final String nickname;

    @Builder
    public MemberInfoResponseDto(String email, String nickname) {
        this.email = email;
        this.nickname = nickname;
    }

    public static MemberInfoResponseDto from(Member member) {
        return MemberInfoResponseDto.builder()
                .email(member.getMemberEmail())
                .nickname(member.getMemberNickname())
                .build();
    }
} 