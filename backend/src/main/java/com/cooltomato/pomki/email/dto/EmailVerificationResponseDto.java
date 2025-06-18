package com.cooltomato.pomki.email.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationResponseDto {
    private boolean success;
    private String message;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String verificationToken;
} 