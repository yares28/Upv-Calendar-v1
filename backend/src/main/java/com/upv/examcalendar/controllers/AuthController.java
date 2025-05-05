package com.upv.examcalendar.controllers;

import com.upv.examcalendar.models.User;
import com.upv.examcalendar.repositories.UserRepository;
import com.upv.examcalendar.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed-origins}")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.get("email"),
                        loginRequest.get("password")));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateJwtToken(authentication);

        User user = userRepository.findByEmail(loginRequest.get("email"))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody Map<String, String> registerRequest) {
        if (userRepository.existsByEmail(registerRequest.get("email"))) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user
        User user = new User();
        user.setName(registerRequest.get("name"));
        user.setEmail(registerRequest.get("email"));
        user.setPassword(passwordEncoder.encode(registerRequest.get("password")));
        user.setSavedDegrees(new HashSet<>());
        user.setSavedSemesters(new HashSet<>());
        user.setSavedSubjects(new HashSet<>());

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/preferences")
    public ResponseEntity<?> saveUserPreferences(@RequestBody Map<String, Object> preferences) {
        // This would typically extract the user from the security context
        // For simplicity, we're assuming the user email is provided in the request
        User user = userRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user preferences
        user.setSavedDegrees(new HashSet<>((java.util.List<String>) preferences.get("degrees")));
        user.setSavedSemesters(new HashSet<>((java.util.List<String>) preferences.get("semesters")));
        user.setSavedSubjects(new HashSet<>((java.util.List<String>) preferences.get("subjects")));

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}