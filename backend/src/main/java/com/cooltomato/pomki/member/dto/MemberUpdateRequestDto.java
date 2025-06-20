package com.cooltomato.pomki.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MemberUpdateRequestDto {
    
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String currentEmail;
    
    @Size(min = 2, max = 20, message = "닉네임은 2-20자 사이여야 합니다.")
    private String nickname;
    
    private String currentPassword;
    
    @Pattern(regexp = "^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d!@#$%^&*()_+=-]{8,}$", 
             message = "패스워드는 8자 이상이며, 영문과 숫자를 포함해야 합니다. 특수문자는 !@#$%^&*()_+=- 만 허용됩니다.")
    private String newPassword;
    
    private boolean isEmailChanged; // 이메일 변경 여부
    
    @Builder
    public MemberUpdateRequestDto(String currentEmail, String nickname, 
                                 String currentPassword, String newPassword, boolean isEmailChanged) {
        this.currentEmail = currentEmail;
        this.nickname = nickname;
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
        this.isEmailChanged = isEmailChanged;
    }
} 