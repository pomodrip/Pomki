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
import com.cooltomato.pomki.member.dto.MemberEmailUpdateRequestDto;
import com.cooltomato.pomki.member.dto.MemberEmailUpdateConfirmDto;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.email.constant.EmailVerificationCode;
import com.cooltomato.pomki.email.dto.EmailVerificationRequestDto;
import com.cooltomato.pomki.email.service.EmailService;
import com.cooltomato.pomki.auth.jwt.JwtProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtProvider jwtProvider;

    @Transactional
    public void signUp(MemberSignUpRequestDto request) {
        if (!emailService.isValidVerificationToken(request.getEmail(), request.getVerificationToken())) {
            throw new BadRequestException("이메일 인증이 완료되지 않았거나 만료된 요청입니다.");
        }
        
        createMember(request);
    }
    
    private Member createMember(MemberSignUpRequestDto request) {
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
                .emailVerified(true) // 이메일 인증 완료
                .build();

        Member savedMember = memberRepository.save(newMember);

        return savedMember;
    }

    @Transactional(readOnly = true)
    public MemberInfoResponseDto readMember(Long memberId) {
        Member member = memberRepository.findByIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));
        return MemberInfoResponseDto.from(member);
    }

    @Transactional
    public void softDeleteMember(Long memberId) {
        Member member = memberRepository.findByIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));
        member.setDeleted(true);
        member.setDeletedAt(LocalDateTime.now());
    }

    @Transactional
    public void hardDeleteMember(Long memberId) {
        memberRepository.deleteById(memberId);
    }

    @Transactional
    public MemberUpdateResponseDto updateMember(Long memberId, MemberUpdateRequestDto request) {
        Member member = memberRepository.findByIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));
        
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

    public void requestEmailChange(Long memberId, MemberEmailUpdateRequestDto request) {
        validateEmailChangeRequest(memberId, request);
        
        EmailVerificationRequestDto emailRequest = 
        EmailVerificationRequestDto.builder()
                .email(request.getNewEmail())
                .type(EmailVerificationCode.EMAIL_CHANGE)
                .build();
        
        emailService.sendVerificationCode(emailRequest);
    }
    
    private void validateEmailChangeRequest(Long memberId, MemberEmailUpdateRequestDto request) {
        Member member = memberRepository.findByIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));
        
        if (memberRepository.existsByMemberEmail(request.getNewEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
        
        if (member.getMemberEmail().equals(request.getNewEmail())) {
            throw new BadRequestException("현재 이메일과 동일합니다.");
        }
    }

    @Transactional
    public void confirmEmailChange(Long memberId, MemberEmailUpdateConfirmDto request) {
        if (!jwtProvider.validateEmailVerificationToken(request.getToken(), request.getNewEmail())) {
            throw new BadRequestException("유효하지 않은 인증 토큰입니다.");
        }
        
        Member member = memberRepository.findByIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 사용자입니다."));
        
        if (memberRepository.existsByMemberEmail(request.getNewEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
        
        member.setCurrentEmail(request.getNewEmail());
        member.setEmailVerified(true);
    }
} 