package com.cooltomato.pomki.email.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.cooltomato.pomki.auth.jwt.JwtProvider;
import com.cooltomato.pomki.email.dto.EmailVerificationConfirmDto;
import com.cooltomato.pomki.email.dto.EmailVerificationRequestDto;
import com.cooltomato.pomki.email.dto.EmailVerificationResponseDto;
import com.cooltomato.pomki.email.entity.EmailVerification;
import com.cooltomato.pomki.email.repository.EmailVerificationRepository;
import com.cooltomato.pomki.email.util.EmailUtil;
import com.cooltomato.pomki.email.constant.EmailVerificationCode;
import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.NotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailUtil emailUtil;
    private final JwtProvider jwtProvider;

    public EmailVerificationResponseDto sendVerificationCode(EmailVerificationRequestDto request) {

        EmailVerification existingVerification = emailVerificationRepository
                .findById(request.getEmail())
                .orElse(null);
        
        if (existingVerification != null && !existingVerification.isVerified()) {
            throw new BadRequestException("이미 인증코드가 발송되었습니다. 잠시 후 다시 시도해주세요.");
        }

        String verificationCode = EmailUtil.generateCode(6);

        EmailVerification emailVerification = EmailVerification.builder()
                .email(request.getEmail())
                .verificationCode(verificationCode)
                .type(request.getType())
                .verified(false)
                .expiresAt(240L)
                .build();
        
        try {
            emailVerificationRepository.save(emailVerification);
            
            String subject = "Pomki 이메일 인증 메일입니다.";
            String content = buildVerificationEmailContent(verificationCode);
            
            log.debug("이메일 발송 시도: {}", request.getEmail());
            emailUtil.sendEmail(request.getEmail(), subject, content);
            log.debug("이메일 발송 성공: {}", request.getEmail());
            
            return EmailVerificationResponseDto.builder()
                    .success(true)
                    .message("인증코드가 발송되었습니다.")
                    .build();
        } catch (Exception e) {
            emailVerificationRepository.deleteById(request.getEmail());
            log.error("이메일 발송 실패: {} - 에러: {}", request.getEmail(), e.getMessage(), e);
            throw new BadRequestException("이메일 발송에 실패했습니다: " + e.getMessage());
        }
    }

    public EmailVerificationResponseDto verifyCode(EmailVerificationConfirmDto request) {
        EmailVerification emailVerification = emailVerificationRepository
                .findById(request.getEmail())
                .orElseThrow(() -> new NotFoundException("인증 요청을 찾을 수 없습니다."));
        
        if (!emailVerification.getVerificationCode().equals(request.getVerificationCode())) {
            throw new BadRequestException("인증코드가 일치하지 않습니다.");
        }

        if (emailVerification.getType() != request.getType()) {
            throw new BadRequestException("인증 목적이 일치하지 않습니다.");
        }

        String verificationToken = null;
        if (EmailVerificationCode.SIGNUP == request.getType() || 
            EmailVerificationCode.EMAIL_CHANGE == request.getType()) {
            verificationToken = jwtProvider.createEmailVerificationToken(request.getEmail());
        }
        
        emailVerificationRepository.deleteById(request.getEmail());
        
        return EmailVerificationResponseDto.builder()
                .success(true)
                .message("이메일 인증이 완료되었습니다.")
                .verificationToken(verificationToken)
                .build();
    }
    
    public boolean isValidVerificationToken(String email, String verificationToken) {
        if (verificationToken == null || verificationToken.trim().isEmpty()) {
            return false;
        }
        
        return jwtProvider.validateEmailVerificationToken(verificationToken, email);
    }
    
    private String buildVerificationEmailContent(String verificationCode) {
        return String.format("""
            Pomki 이메일 인증 메일
            
            이메일 인증을 완료하기 위해 아래 인증코드를 입력해주세요.
            
            인증코드: %s
            
            이 인증코드는 4분간 유효합니다.
            본인이 요청하지 않았다면 이 메일을 무시해주세요.
            
            """, verificationCode);
    }
    

} 