package com.cooltomato.pomki.member.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "회원 이메일 변경 확인 DTO")
public class MemberEmailUpdateConfirmDto {

    @NotBlank(message = "새 이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Schema(description = "새로운 이메일 주소", example = "newemail@example.com")
    private String newEmail;

    @NotBlank(message = "인증 토큰은 필수입니다")
    @Schema(description = "이메일 인증 토큰")
    private String token;
} 