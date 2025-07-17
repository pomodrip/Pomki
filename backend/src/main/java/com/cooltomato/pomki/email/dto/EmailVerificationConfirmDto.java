package com.cooltomato.pomki.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import com.cooltomato.pomki.email.constant.EmailVerificationCode;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationConfirmDto {
    
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @NotBlank(message = "이메일은 필수입니다.")
    private String email;
    
    @NotBlank(message = "인증코드는 필수입니다.")
    private String verificationCode;
    
    @NotNull(message = "인증 타입은 필수입니다.")
    private EmailVerificationCode type;
} 