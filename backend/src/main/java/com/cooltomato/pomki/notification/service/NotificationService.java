package com.cooltomato.pomki.notification.service;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import com.cooltomato.pomki.global.exception.BadRequestException;
import com.cooltomato.pomki.global.exception.NotFoundException;
import com.cooltomato.pomki.global.exception.TokenNotFoundException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;
import com.cooltomato.pomki.notification.dto.NotificationRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationResponseDto;
import com.cooltomato.pomki.notification.dto.NotificationOption;
import com.cooltomato.pomki.notification.dto.NotificationTokenRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenResponseDto;

import com.cooltomato.pomki.notification.entity.FireBaseToken;
import com.cooltomato.pomki.notification.repository.FirebaseTokenRepository;
import com.cooltomato.pomki.notification.util.FCMUtil;
import com.google.firebase.messaging.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final FirebaseMessaging firebaseMessaging;
    private final FirebaseTokenRepository tokenRepository;
    private final MemberRepository memberRepository;


    @Transactional
    public void registerToken(Long memberId, NotificationTokenRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException("회원 정보를 찾을 수 없습니다."));

        if (tokenRepository.existsByFirebaseToken(request.getToken())) {
            log.info("이미 등록된 토큰입니다. token: {}", request.getToken());
            return;
        }

        FireBaseToken token = FireBaseToken.builder()
                .firebaseToken(request.getToken())
                .member(member)
                .platform(request.getPlatform())
                .build();

        tokenRepository.save(token);
        log.info("FCM 토큰이 등록되었습니다. memberId: {}, platform: {}", memberId, request.getPlatform());
    }


    @Transactional
    public void deleteFireBaseToken(String firebaseToken) {
        if (!tokenRepository.existsByFirebaseToken(firebaseToken)) {
            throw new NotFoundException("FCM 토큰을 찾을 수 없습니다.");
        }

        tokenRepository.deleteByFirebaseToken(firebaseToken);
        log.info("FCM 토큰이 삭제되었습니다. token: {}", firebaseToken);
    }


    @Transactional
    public void deleteFireBaseTokenByMemberId(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new NotFoundException("회원 정보를 찾을 수 없습니다.");
        }

        tokenRepository.deleteByMemberId(memberId);
        log.info("회원의 모든 FCM 토큰이 삭제되었습니다. memberId: {}", memberId);
    }




    @Transactional(readOnly = true)
    public List<NotificationTokenResponseDto> readFireBaseTokensByMemberId(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new NotFoundException("회원 정보를 찾을 수 없습니다.");
        }

        return tokenRepository.findByMember_MemberId(memberId)
                .stream()
                .map(token -> NotificationTokenResponseDto.builder()
                        .firebaseToken(token.getFirebaseToken())
                        .platform(token.getPlatform())
                        .createdAt(token.getCreatedAt())
                        .memberId(token.getMember().getMemberId())
                        .memberName(token.getMember().getMemberNickname())
                        .build())
                .collect(Collectors.toList());
    }


    @Transactional(readOnly = true)
    public List<NotificationTokenResponseDto> readFireBaseTokensByMemberIdAndPlatform(Long memberId, FireBasePlatform platform) {
        if (!memberRepository.existsById(memberId)) {
            throw new NotFoundException("회원 정보를 찾을 수 없습니다.");
        }

        return tokenRepository.findByMember_MemberIdAndPlatform(memberId, platform)
                .stream()
                .map(token -> NotificationTokenResponseDto.builder()
                        .firebaseToken(token.getFirebaseToken())
                        .platform(token.getPlatform())
                        .createdAt(token.getCreatedAt())
                        .memberId(token.getMember().getMemberId())
                        .memberName(token.getMember().getMemberNickname())
                        .build())
                .collect(Collectors.toList());
    }




    private List<FireBaseToken> findAllTokensByMemberId(Long memberId) {
        if (!memberRepository.existsById(memberId)) {
            throw new NotFoundException("회원 정보를 찾을 수 없습니다.");
        }
        return tokenRepository.findByMember_MemberId(memberId);
    }


    @Async("notificationTaskExecutor")
    public void sendNotificationToMember(Long memberId, NotificationRequestDto request) {
        List<FireBaseToken> tokens = findAllTokensByMemberId(memberId);
        
        if (tokens.isEmpty()) {
            log.warn("회원 {}에게 알림을 받을 수 있는 디바이스가 없습니다", memberId);
            return;
        }

        sendToTokensAsync(tokens, request);
    }


    @Async("notificationTaskExecutor")
    public void sendNotificationToToken(String deviceToken, FireBasePlatform platform, NotificationRequestDto request) {
        sendSingleMessage(deviceToken, request, platform);
        log.info("지정된 토큰으로 테스트 알림을 전송했습니다: {}", deviceToken);
    }

    // 테스트용 응답 반환 비동기 메서드 (테스트용)
    public CompletableFuture<NotificationResponseDto> sendNotificationToMemberWithResponse(Long memberId, NotificationRequestDto request) {
        List<FireBaseToken> tokens = findAllTokensByMemberId(memberId);
        if (tokens.isEmpty()) {
            return CompletableFuture.completedFuture(
                    NotificationResponseDto.builder()
                            .success(false)
                            .message("알림을 받을 수 있는 디바이스가 없습니다")
                            .sentAt(LocalDateTime.now())
                            .build()
            );
        }

        return CompletableFuture.completedFuture(sendToTokensSync(tokens, request));
    }

    // 비동기 알림 전송 헬퍼 메서드
    private void sendToTokensAsync(List<FireBaseToken> tokens, NotificationRequestDto request) {
        Map<FireBasePlatform, List<String>> tokensByPlatform = tokens.stream()
                .collect(Collectors.groupingBy(
                        FireBaseToken::getPlatform,
                        Collectors.mapping(FireBaseToken::getFirebaseToken, Collectors.toList())
                ));

        for (Map.Entry<FireBasePlatform, List<String>> entry : tokensByPlatform.entrySet()) {
            FireBasePlatform platform = entry.getKey();
            List<String> platformTokens = entry.getValue();
            
            if (!platformTokens.isEmpty()) {
                sendMulticastMessageSync(platformTokens, request, platform);
                log.info("{} 알림 전송 완료: {} 개", platform.name(), platformTokens.size());
            }
        }
    }

    // 비동기 안쓰는 전송 헬퍼 메서드 (테스트용)
    private NotificationResponseDto sendToTokensSync(List<FireBaseToken> tokens, NotificationRequestDto request) {
        Map<FireBasePlatform, List<String>> tokensByPlatform = tokens.stream()
                .collect(Collectors.groupingBy(
                        FireBaseToken::getPlatform,
                        Collectors.mapping(FireBaseToken::getFirebaseToken, Collectors.toList())
                ));

        boolean success = true;
        StringBuilder messageBuilder = new StringBuilder();

        for (Map.Entry<FireBasePlatform, List<String>> entry : tokensByPlatform.entrySet()) {
            FireBasePlatform platform = entry.getKey();
            List<String> platformTokens = entry.getValue();
            
            if (!platformTokens.isEmpty()) {
                NotificationResponseDto result = sendMulticastMessageSync(platformTokens, request, platform);
                if (!result.isSuccess()) {
                    success = false;
                }
                appendMessage(messageBuilder, platform, result.getMessage());
            }
        }

        return NotificationResponseDto.builder()
                .success(success)
                .message(success ? "알림이 성공적으로 전송되었습니다" : 
                        "일부 알림 전송에 실패했습니다 - " + messageBuilder.toString())
                .sentAt(LocalDateTime.now())
                .build();
    }

    private void appendMessage(StringBuilder messageBuilder, FireBasePlatform platform, String message) {
        if (messageBuilder.length() > 0) {
            messageBuilder.append(", ");
        }
        messageBuilder.append(platform.name()).append(": ").append(message);
    }


    private NotificationResponseDto sendMulticastMessageSync(
            List<String> tokens, NotificationRequestDto request, FireBasePlatform platform) {
        
        if (tokens.isEmpty()) {
            return NotificationResponseDto.builder()
                    .success(false)
                    .message("대상 토큰이 없습니다")
                    .sentAt(LocalDateTime.now())
                    .build();
        }

        try {
            MulticastMessage message = FCMUtil.buildMulticastMessage(tokens, request, platform);
            BatchResponse response = firebaseMessaging.sendEachForMulticast(message);
            
            return processMulticastResponse(response, tokens);

        } catch (FirebaseMessagingException e) {
            if (isInvalidTokenError(e.getMessagingErrorCode())) {
                tokenRepository.deleteByFirebaseTokenIn(tokens);
                log.info("유효하지 않은 토큰들을 삭제했습니다: {}", tokens.size());
                
                return NotificationResponseDto.builder()
                        .success(false)
                        .message("일부 토큰이 유효하지 않아 삭제되었습니다")
                        .sentAt(LocalDateTime.now())
                        .build();
            }
            
            throw new RuntimeException("FCM 알림 전송 실패");
        }
    }


    @Async("notificationTaskExecutor")
    public void sendSingleMessage(String token, NotificationRequestDto request, FireBasePlatform platform) {
        try {
            Message message = FCMUtil.buildMessage(token, request, platform);
            String messageId = firebaseMessaging.send(message);
            
            log.info("메시지 전송 성공. messageId: {}, token: {}", messageId, token);
            
        } catch (FirebaseMessagingException e) {
            if (isInvalidTokenError(e.getMessagingErrorCode())) {
                tokenRepository.deleteByFirebaseToken(token);
                log.info("유효하지 않은 토큰을 삭제했습니다: {}", token);
                return; // 무효한 토큰 삭제 후 조용히 종료
            }
            
            throw new RuntimeException("FCM 단일 메시지 전송 실패");
        }
    }

    private NotificationResponseDto processMulticastResponse(BatchResponse response, List<String> tokens) {
      if (response.getFailureCount() > 0) {
        for (int i = 0; i < response.getResponses().size(); i++) {
          SendResponse sendResponse = response.getResponses().get(i);
          if (!sendResponse.isSuccessful()) {
            String token = tokens.get(i);
            FirebaseMessagingException exception = sendResponse.getException();

            if (isInvalidTokenError(exception.getMessagingErrorCode())) {
              tokenRepository.deleteByFirebaseToken(token);
            }
          }
        }
      }

      boolean success = response.getFailureCount() == 0;
      String message = success ? "알림이 성공적으로 전송되었습니다"
          : "일부 알림 전송에 실패했습니다 (성공: " + response.getSuccessCount() + ", 실패: " + response.getFailureCount() + ")";

      return NotificationResponseDto.builder()
          .success(success)
          .message(message)
          .sentAt(LocalDateTime.now())
          .build();
    }

    

    private boolean isInvalidTokenError(MessagingErrorCode errorCode) {
        return errorCode == MessagingErrorCode.UNREGISTERED ||  // HTTP 404
               errorCode == MessagingErrorCode.INVALID_ARGUMENT; // HTTP 400 (토큰이 무효한 경우)
    }


    @Async("notificationTaskExecutor")
    public void sendSimpleNotification(Long memberId, String title, String body) {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .title(title)
                .body(body)
                .build();
        
        sendNotificationToMember(memberId, request);
    }


    @Async("notificationTaskExecutor")
    public void sendNotificationWithAction(Long memberId, String title, String body, String clickAction) {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .title(title)
                .body(body)
                .option(NotificationOption.builder()
                        .clickAction(clickAction)
                        .build())
                .build();
        
        sendNotificationToMember(memberId, request);
    }

    @Async("notificationTaskExecutor")
    public void sendNotificationWithImage(Long memberId, String title, String body, String imageUrl) {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .title(title)
                .body(body)
                .option(NotificationOption.builder()
                        .imageUrl(imageUrl)
                        .build())
                .build();
        
        sendNotificationToMember(memberId, request);
    }

    @Async("notificationTaskExecutor")
    public void sendNotificationToMembers(List<Long> memberIds, String title, String body) {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .title(title)
                .body(body)
                .build();
                
        memberIds.forEach(memberId -> sendNotificationToMember(memberId, request));
    }

    @Async("notificationTaskExecutor")
    public void sendNotificationWithData(Long memberId, String title, String body, Map<String, String> data) {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .title(title)
                .body(body)
                .option(NotificationOption.builder()
                        .data(data)
                        .build())
                .build();
        
        sendNotificationToMember(memberId, request);
    }

    @Async("notificationTaskExecutor")
    public void sendNotificationWithActionAndData(Long memberId, String title, String body, 
                                                  String clickAction, Map<String, String> data) {
        NotificationRequestDto request = NotificationRequestDto.builder()
                .title(title)
                .body(body)
                .option(NotificationOption.builder()
                        .clickAction(clickAction)
                        .data(data)
                        .build())
                .build();
        
        sendNotificationToMember(memberId, request);
    }

} 