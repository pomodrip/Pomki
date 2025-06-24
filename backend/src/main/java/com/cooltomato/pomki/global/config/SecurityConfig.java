package com.cooltomato.pomki.global.config;

import com.cooltomato.pomki.auth.handler.OAuth2LoginSuccessHandler;
import com.cooltomato.pomki.auth.handler.OAuth2LoginFailureHandler;
import com.cooltomato.pomki.global.filter.JwtFilter;
import com.cooltomato.pomki.global.handler.CustomAuthenticationEntryPoint;
import com.cooltomato.pomki.global.handler.CustomAccessDeniedHandler;
import com.cooltomato.pomki.auth.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity // 임시로 허용해봄
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CorsConfig corsConfig;

    private static final String[] PERMIT_PATTERNS = List.of(
            "/login","/favicon.ico","/h2-console/**"
    ).toArray(String[]::new);

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .formLogin((FormLoginConfigurer::disable))
                .cors((customCorsConfig) -> customCorsConfig.configurationSource(corsConfig.corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(PERMIT_PATTERNS).permitAll()
                                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**","/").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/members").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/member/check").permitAll()
                                .requestMatchers(HttpMethod.POST,
                                        "/api/auth/login",
                                        "/api/auth/refresh",
                                        "/api/auth/logout",
                                        "/api/email/verification",
                                        "/api/email/code"
                                ).permitAll()
                                .requestMatchers("/api/**").hasAnyRole("ADMIN", "USER")
                .anyRequest().authenticated()
                )
                .headers((headers)->headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .oauth2Login((oauth2) -> oauth2
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                        .userInfoEndpoint((userInfoEndpoint) ->
                                userInfoEndpoint
                                        .userService(customOAuth2UserService)
                        )
                )
                // .exceptionHandling((exceptions) -> exceptions
                //         .authenticationEntryPoint(customAuthenticationEntryPoint)
                //         .accessDeniedHandler(customAccessDeniedHandler)
                // )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
                
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
} 