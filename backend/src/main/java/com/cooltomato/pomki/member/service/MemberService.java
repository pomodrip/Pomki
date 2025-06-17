package com.cooltomato.pomki.member.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.member.dto.MemberSignUpRequestDto;
import com.cooltomato.pomki.member.dto.SocialSignUpRequestDto;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.global.constant.Role;
import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.dto.MemberInfoResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Member signUp(MemberSignUpRequestDto request) {
        if (memberRepository.existsByMemberEmail(request.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다.");
        }
        Member newMember = Member.builder()
                .memberEmail(request.getEmail())
                .currentEmail(request.getEmail())
                .memberNickname(request.getNickname())
                .memberPassword(passwordEncoder.encode(request.getPassword()))
                .memberRoles(Role.USER)
                .isSocialLogin(false)
                .build();
        return memberRepository.save(newMember);
    }

    @Transactional
    public Member socialSignUp(SocialSignUpRequestDto request) {
        Member newMember = Member.builder()
                .memberEmail(request.getEmail())
                .currentEmail(request.getEmail())
                .memberNickname(request.getNickname())
                .memberRoles(Role.USER)
                .isSocialLogin(true)
                .emailVerified(true)
                .provider(request.getProvider())
                .providerUserId(request.getProviderId())
                .build();
        return memberRepository.save(newMember);
    }

    public MemberInfoResponseDto readMemberInfo(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원 정보를 찾을 수 없습니다."));
        return MemberInfoResponseDto.from(member);
    }

    @Transactional
    public void softDeleteMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원 정보를 찾을 수 없습니다."));
        member.softDelete();
    }

    @Transactional
    public void hardDeleteMember(Long memberId) {
        memberRepository.deleteById(memberId);
    }
} 