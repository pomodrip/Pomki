package com.cooltomato.pomki.notification.controller;

import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.notification.dto.NotificationRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationResponseDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenResponseDto;
import com.cooltomato.pomki.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "알림 API")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/tokens")
    @Operation(summary = "FCM 토큰 등록")
    public ResponseEntity<Void> registerToken(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @Valid @RequestBody NotificationTokenRequestDto request) {
        
        notificationService.registerToken(principalMember.getMemberId(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/tokens/{firebaseToken}")
    @Operation(summary = "특정 FCM 토큰 삭제")
    public ResponseEntity<Void> deleteToken(@PathVariable String firebaseToken) {
        notificationService.deleteFireBaseToken(firebaseToken);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/tokens")
    @Operation(summary = "현재 사용자의 모든 토큰 삭제")
    public ResponseEntity<Void> deleteAllTokens(@AuthenticationPrincipal PrincipalMember principalMember) {
        notificationService.deleteFireBaseTokenByMemberId(principalMember.getMemberId());
        return ResponseEntity.ok().build();
    }



    @GetMapping("/tokens")
    @Operation(summary = "현재 사용자의 토큰 조회")
    public ResponseEntity<List<NotificationTokenResponseDto>> getMyTokens(
            @AuthenticationPrincipal PrincipalMember principalMember) {
        
        List<NotificationTokenResponseDto> tokens = notificationService.readFireBaseTokensByMemberId(principalMember.getMemberId());
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/send")
    @Operation(summary = "특정 회원에게 알림 전송 (비동기)")
    public ResponseEntity<String> sendNotification(
            @RequestParam Long memberId,
            @Valid @RequestBody NotificationRequestDto request) {
        
        notificationService.sendNotificationToMember(memberId, request);
        return ResponseEntity.ok("알림 전송 요청이 처리되었습니다.");
    }

    @PostMapping("/test/send-to-me")
    @Operation(summary = "내 디바이스로 테스트 알림 전송")
    public ResponseEntity<String> sendTestToMe(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @Valid @RequestBody NotificationRequestDto request) {
        
        notificationService.sendNotificationToMember(principalMember.getMemberId(), request);
        return ResponseEntity.ok("테스트 알림 전송 요청이 처리되었습니다.");
    }

    @PostMapping("/test/send-to-token")
    @Operation(summary = "특정 토큰으로 테스트 알림 전송")
    public ResponseEntity<String> sendNotificationToToken(
            @RequestParam String token,
            @Valid @RequestBody NotificationRequestDto request) {
        
        notificationService.sendNotificationToToken(token, request);
        return ResponseEntity.ok("토큰으로 알림 전송 요청이 처리되었습니다.");
    }

    @PostMapping("/test/with-response")
    @Operation(summary = "내 디바이스로 테스트 알림 전송 (응답 포함)")
    public CompletableFuture<ResponseEntity<NotificationResponseDto>> sendTestWithResponse(
            @AuthenticationPrincipal PrincipalMember principalMember,
            @Valid @RequestBody NotificationRequestDto request) {
        
        return notificationService.sendNotificationToMemberWithResponse(principalMember.getMemberId(), request)
                .thenApply(ResponseEntity::ok);
    }
} 