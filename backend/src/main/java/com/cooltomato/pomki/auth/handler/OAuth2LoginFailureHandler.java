package com.cooltomato.pomki.auth.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

  @Value("${pomki.frontend.base-url}")
  private String frontendBaseUrl;

  @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
        AuthenticationException exception) throws IOException, ServletException {
      log.info("OAuth2 Login 실패: {}", exception.getMessage());

      String errorCode = "login_failed";
      int resultCode = 403;

      if (exception instanceof OAuth2AuthenticationException) {
          String errorCd = ((OAuth2AuthenticationException) exception).getError().getErrorCode();
          switch (errorCd) {
              case "DELETED_USER_ACCOUNT":
                  errorCode = "deleted_user";
                  resultCode = 409;
                  break;
          }
      }

      // fromHttpUrl 왜 사라진?
      UriComponents uriComponent= UriComponentsBuilder.fromUriString(frontendBaseUrl)
              .pathSegment("auth","login")
              .queryParam("resultCode", resultCode)
              .queryParam("error", errorCode)
              .encode()
              .build();
      getRedirectStrategy().sendRedirect(request, response, uriComponent.toString());
    }
}