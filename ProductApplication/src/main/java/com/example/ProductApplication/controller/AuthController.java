package com.example.ProductApplication.controller;

import com.example.ProductApplication.entity.User;
import com.example.ProductApplication.security.JwtUtil;
import com.example.ProductApplication.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    // Registration endpoint (includes role)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            String role = user.getRoles().iterator().next().getName(); // get first role
            userService.registerUser(user.getUsername(), user.getPassword(), role);

            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully with role: " + role);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Login endpoint (returns JWT as JSON)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            User user = userService.getUserByUsername(username);

            String token = jwtUtil.generateToken(user, userDetails);

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Login failed: " + e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }
}
