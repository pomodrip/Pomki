package com.cooltomato.pomki.member.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.cooltomato.pomki.global.constant.Role;
import com.cooltomato.pomki.global.exception.AlreadyExistsEmailException;
import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.MemberNotFoundException;
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
import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.global.exception.SocialUnlinkFailedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, String> redisTemplate;
    private final RestTemplate restTemplate;

    @Transactional
    public void signUp(MemberSignUpRequestDto request) {
        if (!emailService.isValidVerificationToken(request.getEmail(), request.getVerificationToken())) {
            throw new BadRequestException("이메일 인증이 완료되지 않았거나 만료된 요청입니다.");
        }
        
        createMember(request);
    }
    public void signUpTest(MemberSignUpRequestDto request){
        Member member = createTestMember(request);
        memberRepository.save(member);
    }
    @Transactional
    private Member createTestMember(MemberSignUpRequestDto request){
        Member member = Member.builder()
                .memberEmail(request.getEmail())
                .currentEmail(request.getEmail())
                .memberNickname(request.getNickname())
                .memberPassword(passwordEncoder.encode(request.getPassword()))
                .memberRoles(Role.USER)
                .isSocialLogin(false)
                .emailVerified(true)
                .build();
        return member;
    }
    private Member createMember(MemberSignUpRequestDto request) {
        if (memberRepository.existsByMemberEmail(request.getEmail())) {
            throw new AlreadyExistsEmailException("이미 사용중인 이메일입니다.");
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
        Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        return MemberInfoResponseDto.from(member);
    }


    @Transactional(readOnly = true)
    public MemberInfoResponseDto readMemberWithBookmarks(Long memberId) {
        Member member = memberRepository.findByMemberIdWithBookmarks(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        return MemberInfoResponseDto.from(member);
    }


    @Transactional(readOnly = true)
    public MemberInfoResponseDto readMemberWithCardBookmarks(Long memberId) {
        Member member = memberRepository.findByMemberIdWithCardBookmarks(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        return MemberInfoResponseDto.from(member);
    }


    @Transactional(readOnly = true)
    public MemberInfoResponseDto readMemberWithTrashItems(Long memberId) {
        Member member = memberRepository.findByMemberIdWithTrashItems(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        return MemberInfoResponseDto.from(member);
    }

    @Transactional
    public void softDeleteMember(Long memberId) {
        Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));

        if (member.isSocialLogin()) {
            unlinkSocialAccount(member);
        }

        member.setDeleted(true);
        member.setDeletedAt(LocalDateTime.now());
    }

    @Transactional
    public void hardDeleteMember(Long memberId) {
        Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        
        if (member.isSocialLogin()) {
            unlinkSocialAccount(member);
        }
        
        memberRepository.deleteById(memberId);
    }

    private void unlinkSocialAccount(Member member) {
        String provider = member.getProvider().name();
        String providerUserId = member.getProviderUserId();
        String redisKey = "social:accessToken:" + provider + ":" + providerUserId;
        String accessToken = redisTemplate.opsForValue().get(redisKey);

        if (accessToken != null) {
            if (member.getProvider() == AuthType.KAKAO) {
                unlinkKakao(accessToken);
            } else if (member.getProvider() == AuthType.GOOGLE) {
                unlinkGoogle(accessToken);
            }
            redisTemplate.delete(redisKey);
        }
    }

    private void unlinkKakao(String accessToken) {
        String url = "https://kapi.kakao.com/v1/user/unlink";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new SocialUnlinkFailedException("카카오 연동 해제에 실패했습니다. 다시 로그인 후 시도해주세요.", e);
        }
    }

    private void unlinkGoogle(String accessToken) {
        String url = "https://accounts.google.com/o/oauth2/revoke?token=" + accessToken;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        } catch (HttpClientErrorException e) {
            throw new SocialUnlinkFailedException("구글 연동 해제에 실패했습니다. 다시 로그인 후 시도해주세요.", e);
        }
    }


    @Scheduled(cron = "0 0 2 */2 * ?")
    @Transactional
    public void hardDeleteExpiredMembers() {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        List<Member> targets =
            memberRepository.findByIsDeletedTrueAndDeletedAtBefore(cutoff);

        if (targets.isEmpty()) {
            log.debug("삭제 대상 회원 없음");
            return;
        }

        memberRepository.deleteAll(targets);
        memberRepository.flush(); // 혹시몰라서 넣음    

        log.info("탈퇴 후 30일 경과 회원 {}명 하드 삭제 완료", targets.size());
    }
    @Transactional
    public MemberUpdateResponseDto updateMember(Long memberId, MemberUpdateRequestDto request) {
        Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        
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
        Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        
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
        
        Member member = memberRepository.findByMemberIdAndIsDeletedIsFalse(memberId)
                .orElseThrow(() -> new MemberNotFoundException("존재하지 않는 사용자입니다."));
        
        if (memberRepository.existsByMemberEmail(request.getNewEmail())) {
            throw new BadRequestException("이미 사용 중인 이메일입니다.");
        }
        
        member.setCurrentEmail(request.getNewEmail());
        member.setEmailVerified(true);
    }
} 