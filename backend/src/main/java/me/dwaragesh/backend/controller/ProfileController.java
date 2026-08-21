package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.PatchProfileRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.service.ProfileService;
import me.dwaragesh.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService service;
    private final UserService userService;

    public ProfileController(ProfileService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleExceptions(Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of("error", e.getClass().getName(), "message", e.getMessage() == null ? "null" : e.getMessage()));
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getEmail(), principal.getPicture());
        return ResponseEntity.ok(service.getProfileAndTrackView(user.getUserName(), null));
    }

    @PatchMapping
    public ResponseEntity<ProfileResponse> patchProfile(@AuthenticationPrincipal OidcUser principal, @RequestBody PatchProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getEmail(), principal.getPicture());
        return ResponseEntity.ok(service.patchProfile(user, request));
    }

    @GetMapping("/analytics")
    public ResponseEntity<me.dwaragesh.backend.model.dto.AnalyticsResponse> getAnalytics(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getEmail(), principal.getPicture());
        return ResponseEntity.ok(service.getAnalytics(user));
    }
}
