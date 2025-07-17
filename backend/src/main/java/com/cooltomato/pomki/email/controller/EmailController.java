package com.cooltomato.pomki.email.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;

import com.cooltomato.pomki.email.dto.EmailVerificationConfirmDto;
import com.cooltomato.pomki.email.dto.EmailVerificationRequestDto;
import com.cooltomato.pomki.email.dto.EmailVerificationResponseDto;
import com.cooltomato.pomki.email.service.EmailService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@Validated
@Tag(name = "Email Verification", description = "이메일 인증 API")
public class EmailController {
    
    private final EmailService emailService;
    
    @Operation(summary = "이메일 인증코드 발송", description = "지정된 이메일로 6자리 인증코드를 발송합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "인증코드 발송 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (중복 발송 등)"),
        @ApiResponse(responseCode = "500", description = "이메일 발송 실패")
    })
    @PostMapping("/verification")
    public ResponseEntity<EmailVerificationResponseDto> sendVerificationCode(
            @Valid @RequestBody EmailVerificationRequestDto request) {
        emailService.sendVerificationCode(request);
        
        EmailVerificationResponseDto response = EmailVerificationResponseDto.builder()
                .success(true)
                .message("인증코드 발송이 요청되었습니다.")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @Operation(summary = "이메일 인증코드 확인", description = "입력받은 인증코드를 확인하여 이메일 인증을 완료합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "인증 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 인증코드"),
        @ApiResponse(responseCode = "404", description = "인증 요청을 찾을 수 없음")
    })
    @PostMapping("/code")
    public ResponseEntity<EmailVerificationResponseDto> verifyCode(
            @Valid @RequestBody EmailVerificationConfirmDto request) {
        EmailVerificationResponseDto response = emailService.verifyCode(request);
        return ResponseEntity.ok(response);
    }
} 