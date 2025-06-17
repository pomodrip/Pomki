package com.cooltomato.pomki.member.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import com.cooltomato.pomki.member.service.MemberService;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.member.dto.MemberInfoResponseDto;
import com.cooltomato.pomki.member.dto.MemberSignUpRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<MemberInfoResponseDto> readMyInfo(@AuthenticationPrincipal PrincipalMember principal) {
        MemberInfoResponseDto response = memberService.readMemberInfo(principal.getMemberInfo().getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal PrincipalMember principal) {
        memberService.softDeleteMember(principal.getMemberId());
        return ResponseEntity.ok().build();
    }
} 