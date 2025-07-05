package com.cooltomato.pomki.notification.service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.cooltomato.pomki.notification.dto.NotificationRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationResponseDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenRequestDto;
import com.cooltomato.pomki.notification.dto.NotificationTokenResponseDto;
import com.cooltomato.pomki.global.constant.FireBasePlatform;

@Service
@Profile("local")
public class MockNotificationServiceImpl implements NotificationService {

  @Override
  public void registerToken(Long memberId, NotificationTokenRequestDto request) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'registerToken'");
  }

  @Override
  public void deleteFireBaseToken(String firebaseToken) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'deleteFireBaseToken'");
  }

  @Override
  public void deleteFireBaseTokenByMemberId(Long memberId) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'deleteFireBaseTokenByMemberId'");
  }

  @Override
  public List<NotificationTokenResponseDto> readFireBaseTokensByMemberId(Long memberId) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'readFireBaseTokensByMemberId'");
  }

  @Override
  public List<NotificationTokenResponseDto> readFireBaseTokensByMemberIdAndPlatform(Long memberId, FireBasePlatform platform) {
    // TODO Auto-generated method stub
    throw new UnsupportedOperationException("Unimplemented method 'readFireBaseTokensByMemberIdAndPlatform'");
  }

  @Override
  public void sendNotificationToMember(Long memberId, NotificationRequestDto request) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public CompletableFuture<NotificationResponseDto> sendNotificationToMemberWithResponse(Long memberId,
      NotificationRequestDto request) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void sendNotificationToMembers(List<Long> memberIds, String title, String body) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendNotificationToToken(String deviceToken,
      com.cooltomato.pomki.global.constant.FireBasePlatform platform, NotificationRequestDto request) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendNotificationWithAction(Long memberId, String title, String body, String clickAction) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendNotificationWithActionAndData(Long memberId, String title, String body, String clickAction,
      Map<String, String> data) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendNotificationWithData(Long memberId, String title, String body, Map<String, String> data) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendNotificationWithImage(Long memberId, String title, String body, String imageUrl) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendSimpleNotification(Long memberId, String title, String body) {
    // TODO Auto-generated method stub
    
  }

  @Override
  public void sendSingleMessage(String token, NotificationRequestDto request,
      com.cooltomato.pomki.global.constant.FireBasePlatform platform) {
    // TODO Auto-generated method stub
    
  }

}
