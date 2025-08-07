package com.example.ProductApplication.security;

import io.jsonwebtoken.*;

import io.jsonwebtoken.security.Keys;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.example.ProductApplication.entity.User;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Component
public class JwtUtil {
    private final String SECRET_KEY = "YourSuperSecureSecretKeyYourSuperSecureSecretKey"; 

    
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String generateToken(User user, UserDetails userDetails) {
    String role = userDetails.getAuthorities().stream()
        .findFirst()
        .map(GrantedAuthority::getAuthority)
        .orElse(""); // returns ROLE_USER or ROLE_ADMIN

    return Jwts.builder()
        .setSubject(user.getUsername())
        .claim("userId", user.getId())
        .claim("role", role) // storing "ROLE_USER" or "ROLE_ADMIN"
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + 3600000))
        .signWith(getSignKey(), SignatureAlgorithm.HS256)
        .compact();
}

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        Object userId = claims.get("userId");

        if (userId instanceof Integer) {
            return ((Integer) userId).longValue();  // In case it's saved as Integer
        } else if (userId instanceof Long) {
            return (Long) userId;
        } else {
            return Long.parseLong(userId.toString());
        }
    }

}
