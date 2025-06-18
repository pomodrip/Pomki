package com.cooltomato.pomki.auth.jwt;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.cooltomato.pomki.auth.dto.MemberInfoDto;
import com.cooltomato.pomki.auth.dto.PrincipalMember;
import com.cooltomato.pomki.auth.dto.TokenResponseDto;
import com.cooltomato.pomki.auth.entity.RefreshToken;
import com.cooltomato.pomki.auth.repository.RefreshTokenRepository;
import com.cooltomato.pomki.global.constant.AuthType;
import com.cooltomato.pomki.global.constant.Role;
import com.cooltomato.pomki.global.exception.InvalidTokenException;
import com.cooltomato.pomki.member.entity.Member;
import com.cooltomato.pomki.member.repository.MemberRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtProvider {

    private final RefreshTokenRepository refreshTokenRepository;
    private final MemberRepository memberRepository;

    @Value("${pomki.jwt.secret:testewetewaegwiopgweiawegjoiawegj}")
    private String secret;

    private SecretKey key;

    private static final long ACCESS_TOKEN_EXPIRE_TIME = 1000L * 60 * 5; // 30분
    private static final long REFRESH_TOKEN_EXPIRE_TIME = 1000L * 60 * 60 * 24 * 1; // 2주

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // @Transactional(readOnly = true)
    public TokenResponseDto createAndSaveTokens(MemberInfoDto memberInfo) {
        String accessToken = createAccessToken(memberInfo);
        String refreshToken = createRefreshToken(memberInfo);

        RefreshToken tokenEntity = RefreshToken.builder()
                .refreshToken(refreshToken)
                .memberId(memberInfo.getMemberId())
                .createdAt(LocalDateTime.now())
                .expiresAt(REFRESH_TOKEN_EXPIRE_TIME / 1000)
                .build();
        refreshTokenRepository.save(tokenEntity);

        return TokenResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public String createAccessToken(MemberInfoDto memberInfo) {
        Instant now = Instant.now();
        Instant expires_time = now.plusMillis(ACCESS_TOKEN_EXPIRE_TIME);
        return Jwts.builder()
                .subject(String.valueOf(memberInfo.getMemberId()))
                .claim("role", memberInfo.getRoles().name())
                .claim("email", memberInfo.getEmail())
                .claim("isSocial", memberInfo.isSocialLogin())
                .claim("provider", memberInfo.getProvider() != null ? memberInfo.getProvider().name() : null)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expires_time))
                .signWith(key)
                .compact();
    }

    public String createAccessTokenFromAuthentication(Authentication authentication) {
        PrincipalMember principal = (PrincipalMember) authentication.getPrincipal();
        MemberInfoDto memberInfo = principal.getMemberInfo();

// 전에 분명 이렇게 대충 Enum으로 처리했다가 문제가 발생한 적 있었던 것 같은데 테스트 필요
        // String role = authentication.getAuthorities().stream()
        //         .map(GrantedAuthority::getAuthority)
        //         .findFirst()
        //         .orElseThrow(() -> new InvalidTokenException("권한 정보가 없습니다."));
        String role = memberInfo.getRoles().name();

        String providerName = null;
        if (authentication instanceof OAuth2AuthenticationToken) {
            providerName = ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId();
        } else if (memberInfo.getProvider() != null) {
            providerName = memberInfo.getProvider().name();
        }

        Instant now = Instant.now();
        Instant expires_time = now.plusMillis(ACCESS_TOKEN_EXPIRE_TIME);

        return Jwts.builder()
                .subject(String.valueOf(memberInfo.getMemberId()))
                .claim("role", role)
                .claim("email", memberInfo.getEmail())
                .claim("isSocial", memberInfo.isSocialLogin())
                .claim("provider", providerName)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expires_time))
                .signWith(key)
                .compact();
    }

    public String createRefreshToken(MemberInfoDto memberInfo) {
        Instant now = Instant.now();
        Instant expires_time = now.plusMillis(REFRESH_TOKEN_EXPIRE_TIME);
        return Jwts.builder()
                .subject(String.valueOf(memberInfo.getMemberId()))
                .claim("role", memberInfo.getRoles().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expires_time))
                .signWith(key)
                .compact();
    }

    @Transactional(readOnly = true)
    public String createAccessTokenFromRefreshToken(String accessToken, String refreshToken) {
        if (!validateToken(refreshToken)) {
            throw new InvalidTokenException("유효하지 않은 리프레시 토큰입니다.");
        }

        Claims expiredClaims = getClaimsFromExpiredToken(accessToken);
        String expiredTokenSubject = expiredClaims.getSubject();

        Claims refreshClaims = parseClaims(refreshToken);
        String refreshTokenSubject = refreshClaims.getSubject();

        if (!expiredTokenSubject.equals(refreshTokenSubject)) {
            throw new InvalidTokenException("토큰의 사용자 정보가 일치하지 않습니다.");
        }
        
        refreshTokenRepository.findById(refreshToken)
                .orElseThrow(() -> new InvalidTokenException("DB에 존재하지 않는 리프레시 토큰입니다."));

        Long memberId = Long.valueOf(refreshTokenSubject);
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new InvalidTokenException("존재하지 않는 사용자입니다."));

        if (member.isDeleted()) {
            throw new InvalidTokenException("삭제된 사용자입니다.");
        }

        MemberInfoDto memberInfo = MemberInfoDto.builder()
                .memberId(member.getMemberId())
                .email(member.getMemberEmail())
                .roles(member.getMemberRoles())
                .isSocialLogin(member.isSocialLogin())
                .provider(member.getProvider())
                .build();

        return createAccessToken(memberInfo);
    }

    public Authentication getAuthentication(String token) {
        Claims claims = parseClaims(token);
        if (claims.get("role") == null) {
            throw new InvalidTokenException("권한 정보가 없는 토큰입니다.");
        }

        boolean isSocial = claims.get("isSocial", Boolean.class);
        String providerName = claims.get("provider", String.class);
        AuthType provider = providerName != null ? AuthType.valueOf(providerName) : null;

        MemberInfoDto memberInfo = MemberInfoDto.builder()
                .memberId(Long.valueOf(claims.getSubject()))
                .email(claims.get("email", String.class))
                .roles(Role.valueOf(claims.get("role", String.class)))
                .isSocialLogin(isSocial)
                .provider(provider)
                .build();

        PrincipalMember principal = PrincipalMember.builder()
                .memberInfo(memberInfo)
                .attributes(claims)
                .build();

        Collection<? extends GrantedAuthority> authorities = principal.getAuthorities();

        if (isSocial) {
            return new OAuth2AuthenticationToken(principal, authorities, providerName);
        } else {
            return new UsernamePasswordAuthenticationToken(principal, null, authorities);
        }
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = parseClaims(token);
            return !claims.getExpiration().before(Date.from(Instant.now()));
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    private Claims getClaimsFromExpiredToken(String token) {
        try {
            return parseClaims(token);
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            return e.getClaims();
        }
    }

    @Transactional(readOnly = true)
    public void invalidateAllMemberToken(Long memberId) {
        List<RefreshToken> userTokens = refreshTokenRepository.findByMemberId(memberId);
        refreshTokenRepository.deleteAll(userTokens);
    }

    public int getRefreshTokenExpireTime() {
        return (int) (REFRESH_TOKEN_EXPIRE_TIME>=Integer.MAX_VALUE?60*60*24*365:REFRESH_TOKEN_EXPIRE_TIME);
    }

    public String createEmailVerificationToken(String email) {
        Instant now = Instant.now();
        Instant expires_time = now.plusMillis(1000L * 60 * 30); // 30분 만료
        
        return Jwts.builder()
                .subject(email)
                .claim("type", "EMAIL_VERIFICATION")
                .issuedAt(Date.from(now))
                .expiration(Date.from(expires_time))
                .signWith(key)
                .compact();
    }

    public boolean validateEmailVerificationToken(String token, String email) {
        try {
            Claims claims = parseClaims(token);
            if (!"EMAIL_VERIFICATION".equals(claims.get("type", String.class))) {
                return false;
            }
            if (!email.equals(claims.getSubject())) {
                return false;
            }
            return !claims.getExpiration().before(Date.from(Instant.now()));
        } catch (Exception e) {
            return false;
        }
    }

    public Claims getEmailVerificationClaims(String token) {
        Claims claims = parseClaims(token);
        if (!"EMAIL_VERIFICATION".equals(claims.get("type", String.class))) {
            throw new InvalidTokenException("이메일 인증 토큰이 아닙니다.");
        }
        return claims;
    }
} 