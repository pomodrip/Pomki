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

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<Void> signUp(@Valid @RequestBody MemberSignUpRequestDto request) {
        memberService.signUp(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    public ResponseEntity<MemberInfoResponseDto> readMemberInfo(@AuthenticationPrincipal PrincipalMember principal) {
        MemberInfoResponseDto response = memberService.readMemberInfo(principal.getMemberInfo().getMemberId());
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<MemberUpdateResponseDto> updateMemberInfo(@AuthenticationPrincipal PrincipalMember principal, @Valid @RequestBody MemberUpdateRequestDto request) {
        MemberUpdateResponseDto response = memberService.updateMemberInfo(
                principal.getMemberInfo().getMemberId(), request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMember(@AuthenticationPrincipal PrincipalMember principal) {
        memberService.softDeleteMember(principal.getMemberId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/my/email")
    public ResponseEntity<Void> requestEmailChange(
            @AuthenticationPrincipal PrincipalMember principal, 
            @Valid @RequestBody MemberEmailUpdateRequestDto request) {
        memberService.requestEmailChange(principal.getMemberInfo().getMemberId(), request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/my/email/verification")
    public ResponseEntity<Void> confirmEmailChange(
            @AuthenticationPrincipal PrincipalMember principal,
            @Valid @RequestBody MemberEmailUpdateConfirmDto request) {
        memberService.confirmEmailChange(principal.getMemberInfo().getMemberId(), request);
        return ResponseEntity.ok().build();
    }
} 