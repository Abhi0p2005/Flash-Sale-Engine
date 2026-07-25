package com.flashengine.flashEngine.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey accessSecret;
    private final SecretKey refreshSecret;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtTokenProvider(
            @Value("${jwt.access-secret:flashEngineAccessSecretKey2026VeryLongSecureString}") String accessSecretStr,
            @Value("${jwt.refresh-secret:flashEngineRefreshSecretKey2026EvenLongerMoreSecureString}") String refreshSecretStr,
            @Value("${jwt.access-expiration:900000}") long accessExpiration,
            @Value("${jwt.refresh-expiration:604800000}") long refreshExpiration) {
        this.accessSecret = Keys.hmacShaKeyFor(accessSecretStr.getBytes(StandardCharsets.UTF_8));
        this.refreshSecret = Keys.hmacShaKeyFor(refreshSecretStr.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    public String generateAccessToken(Long userId, String email, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + accessExpiration))
                .signWith(accessSecret)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshExpiration))
                .signWith(refreshSecret)
                .compact();
    }

    public Long getUserIdFromAccessToken(String token) {
        return Long.parseLong(parseClaims(token, accessSecret).getSubject());
    }

    public Long getUserIdFromRefreshToken(String token) {
        return Long.parseLong(parseClaims(token, refreshSecret).getSubject());
    }

    public boolean validateAccessToken(String token) {
        return validateToken(token, accessSecret);
    }

    public boolean validateRefreshToken(String token) {
        return validateToken(token, refreshSecret);
    }

    public String getClaimFromAccessToken(String token, String claimName) {
        return parseClaims(token, accessSecret).get(claimName, String.class);
    }

    private Claims parseClaims(String token, SecretKey secret) {
        return Jwts.parser()
                .verifyWith(secret)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean validateToken(String token, SecretKey secret) {
        try {
            parseClaims(token, secret);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
