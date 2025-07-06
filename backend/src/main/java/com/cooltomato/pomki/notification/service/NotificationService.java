package com.cooltomato.pomki.notification.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.global.constant.FireBasePlatform;
import com.cooltomato.pomki.notification.dto.NotificationRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationResponseDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenResponseDto;

public interface NotificationService {

  void registerToken(Long memberId, NotificationTokenRequestDto request);

  void deleteFireBaseToken(String firebaseToken);

  void deleteFireBaseTokenByMemberId(Long memberId);

  List<NotificationTokenResponseDto> readFireBaseTokensByMemberId(Long memberId);

  List<NotificationTokenResponseDto> readFireBaseTokensByMemberIdAndPlatform(Long memberId, FireBasePlatform platform);

  void sendNotificationToMember(Long memberId, NotificationRequestDto request);

  void sendNotificationToToken(String deviceToken, FireBasePlatform platform, NotificationRequestDto request);

  // 테스트용 응답 반환 비동기 메서드 (테스트용)
  CompletableFuture<NotificationResponseDto> sendNotificationToMemberWithResponse(Long memberId,
      NotificationRequestDto request);

  void sendSingleMessage(String token, NotificationRequestDto request, FireBasePlatform platform);

  void sendSimpleNotification(Long memberId, String title, String body);

  void sendNotificationWithAction(Long memberId, String title, String body, String clickAction);

  void sendNotificationWithImage(Long memberId, String title, String body, String imageUrl);

  void sendNotificationToMembers(List<Long> memberIds, String title, String body);

  void sendNotificationWithData(Long memberId, String title, String body, Map<String, String> data);

  void sendNotificationWithActionAndData(Long memberId, String title, String body,
      String clickAction, Map<String, String> data);

}