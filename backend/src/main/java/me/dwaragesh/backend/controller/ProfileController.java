package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.PatchProfileRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.service.ProfileService;
import me.dwaragesh.backend.service.UserService;
import jakarta.validation.Valid;
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


    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getEmail(), principal.getPicture());
        return ResponseEntity.ok(service.getProfileAndTrackView(user.getUserName(), null));
    }

    @PatchMapping
    public ResponseEntity<ProfileResponse> patchProfile(@AuthenticationPrincipal OidcUser principal, @Valid @RequestBody PatchProfileRequest request) {
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

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        boolean exists = service.isUsernameTaken(username);
        return ResponseEntity.ok(exists);
    }

    /**
     * Builds a safe check response for social/platform uniqueness checks.
     * Returns whether the value is taken; deliberately omits ownerUsername
     * to prevent enumeration / deanonymization.
     * Exception: the ownerUsername is retained for platform checks (GitHub, LeetCode, LinkedIn)
     * because platform usernames are already semi-public and the frontend UX needs them.
     */
    private ResponseEntity<java.util.Map<String, Object>> buildCheckResponse(String owner) {
        if (owner != null) {
            return ResponseEntity.ok(java.util.Map.of("taken", true, "ownerUsername", owner));
        }
        return ResponseEntity.ok(java.util.Map.of("taken", false));
    }

    /** CRIT-3: check-mail never reveals the ownerUsername — only a boolean. */
    private ResponseEntity<java.util.Map<String, Object>> buildMailCheckResponse(String owner) {
        return ResponseEntity.ok(java.util.Map.of("taken", owner != null));
    }

    @GetMapping("/check-linkedin")
    public ResponseEntity<java.util.Map<String, Object>> checkLinkedin(@RequestParam String username) {
        return buildCheckResponse(service.checkLinkedinOwner(username));
    }

    @GetMapping("/check-github")
    public ResponseEntity<java.util.Map<String, Object>> checkGithub(@RequestParam String username) {
        return buildCheckResponse(service.checkGithubOwner(username));
    }

    @GetMapping("/check-leetcode")
    public ResponseEntity<java.util.Map<String, Object>> checkLeetcode(@RequestParam String username) {
        return buildCheckResponse(service.checkLeetcodeOwner(username));
    }

    @GetMapping("/check-mail")
    public ResponseEntity<java.util.Map<String, Object>> checkMail(@RequestParam String email) {
        return buildMailCheckResponse(service.checkMailOwner(email));
    }

    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(@AuthenticationPrincipal OidcUser principal, @Valid @RequestBody me.dwaragesh.backend.model.dto.OnBoardingRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getEmail(), principal.getPicture());
        return ResponseEntity.ok(service.createProfile(user, request));
    }
}
