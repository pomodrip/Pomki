package com.cooltomato.pomki.member.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import com.cooltomato.pomki.member.service.MemberService;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.member.dto.MemberInfoResponseDto;
import com.cooltomato.pomki.member.dto.MemberSignUpRequestDto;
import com.cooltomato.pomki.member.dto.MemberUpdateRequestDto;
import com.cooltomato.pomki.member.dto.MemberUpdateResponseDto;
import com.cooltomato.pomki.member.dto.MemberEmailUpdateRequestDto;
import com.cooltomato.pomki.member.dto.MemberEmailUpdateConfirmDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@Tag(name = "Member", description = "회원 관리 API")
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @Operation(summary = "회원가입", description = "이메일, 닉네임, 비밀번호로 회원가입을 진행합니다.")
    @PostMapping
    public ResponseEntity<Void> signUp(@Valid @RequestBody MemberSignUpRequestDto request) {
        memberService.signUp(request);
        return ResponseEntity.ok().build();
    }
    @Operation(summary = "테스트 회원가입", description = "테스트용 계정으로 회원가입을 진행합니다.")
    @PostMapping("/test")
    public ResponseEntity<Void> signUpTest() {
        MemberSignUpRequestDto request = new MemberSignUpRequestDto();
        request.setEmail("test@test.com");
        request.setNickname("test");
        request.setPassword("test");
        request.setVerificationToken("test");
        memberService.signUpTest(request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 회원 정보를 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<MemberInfoResponseDto> readMemberInfo(@AuthenticationPrincipal PrincipalMember principal) {
        MemberInfoResponseDto response = memberService.readMember(principal.getMemberInfo().getMemberId());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 정보 수정", description = "회원의 닉네임, 비밀번호 등 정보를 수정합니다.")
    @PutMapping
    public ResponseEntity<MemberUpdateResponseDto> updateMemberInfo(@AuthenticationPrincipal PrincipalMember principal, @Valid @RequestBody MemberUpdateRequestDto request) {
        MemberUpdateResponseDto response = memberService.updateMember(
                principal.getMemberInfo().getMemberId(), request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 탈퇴", description = "회원의 계정을 탈퇴(소프트 삭제) 처리합니다.")
    @DeleteMapping
    public ResponseEntity<Void> deleteMember(@AuthenticationPrincipal PrincipalMember principal) {
        memberService.softDeleteMember(principal.getMemberId());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "이메일 변경 요청", description = "회원의 이메일 변경을 요청합니다.")
    @PutMapping("/my/email")
    public ResponseEntity<Void> requestEmailChange(
            @AuthenticationPrincipal PrincipalMember principal, 
            @Valid @RequestBody MemberEmailUpdateRequestDto request) {
        memberService.requestEmailChange(principal.getMemberInfo().getMemberId(), request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "이메일 변경 인증", description = "이메일 변경을 인증합니다.")
    @PutMapping("/my/email/verification")
    public ResponseEntity<Void> confirmEmailChange(
            @AuthenticationPrincipal PrincipalMember principal,
            @Valid @RequestBody MemberEmailUpdateConfirmDto request) {
        memberService.confirmEmailChange(principal.getMemberInfo().getMemberId(), request);
        return ResponseEntity.ok().build();
    }
} 