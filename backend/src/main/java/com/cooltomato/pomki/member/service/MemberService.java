package com.cooltomato.pomki.member.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cooltomato.pomki.global.constant.Role;
import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.member.dto.MemberInfoResponseDto;
import com.cooltomato.pomki.member.dto.MemberSignUpRequestDto;
import com.cooltomato.pomki.member.dto.MemberUpdateRequestDto;
import com.cooltomato.pomki.member.dto.MemberUpdateResponseDto;
import com.cooltomato.pomki.member.dto.SocialSignUpRequestDto;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;

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
        member.setDeleted(true);
        member.setDeletedAt(LocalDateTime.now());
    }

    @Transactional
    public void hardDeleteMember(Long memberId) {
        memberRepository.deleteById(memberId);
    }

    @Transactional
    public MemberUpdateResponseDto updateMemberInfo(Long memberId, MemberUpdateRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원 정보를 찾을 수 없습니다."));
        
        if (StringUtils.hasText(request.getNewPassword())) {
            if (member.isSocialLogin()) {
                throw new BadRequestException("소셜 로그인 사용자는 패스워드를 변경할 수 없습니다.");
            }
            validatePasswordChange(member, request);
            member.setMemberPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        if (StringUtils.hasText(request.getNickname())) {
            member.setMemberNickname(request.getNickname());
        }
        
        if (StringUtils.hasText(request.getCurrentEmail())) {
            member.setCurrentEmail(request.getCurrentEmail());
        }
        
        return MemberUpdateResponseDto.builder()
                .memberId(member.getMemberId())
                .memberEmail(member.getMemberEmail())
                .currentEmail(member.getCurrentEmail())
                .memberNickname(member.getMemberNickname())
                .isSocialLogin(member.isSocialLogin())
                .updatedAt(member.getUpdatedAt())
                .build();
    }

    private void validatePasswordChange(Member member, MemberUpdateRequestDto request) {
        if (!StringUtils.hasText(request.getCurrentPassword())) {
            throw new BadRequestException("현재 패스워드를 입력해주세요.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getMemberPassword())) {
            throw new BadRequestException("현재 패스워드가 일치하지 않습니다.");
        }
    }
} 