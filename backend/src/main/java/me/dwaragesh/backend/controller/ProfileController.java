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
        User user = userService.findOrCreateFromGoogle(principal);
        return ResponseEntity.ok(service.getProfile(user.getUserName()));
    }

    @PatchMapping
    public ResponseEntity<ProfileResponse> patchProfile(@AuthenticationPrincipal OidcUser principal, @Valid @RequestBody PatchProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal);
        return ResponseEntity.ok(service.patchProfile(user, request));
    }

    @GetMapping("/analytics")
    public ResponseEntity<me.dwaragesh.backend.model.dto.AnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal OidcUser principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal);
        return ResponseEntity.ok(service.getAnalytics(user, org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100))));
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
     */
    private ResponseEntity<java.util.Map<String, Object>> buildCheckResponse(String owner, OidcUser principal) {
        boolean taken = false;
        if (owner != null) {
            taken = true;
            if (principal != null) {
                User user = userService.findOrCreateFromGoogle(principal);
                if (user.getProfile() != null && owner.equals(user.getProfile().getUserName())) {
                    taken = false;
                }
            }
        }
        return ResponseEntity.ok(java.util.Map.of("taken", taken));
    }

    private ResponseEntity<java.util.Map<String, Object>> buildMailCheckResponse(String owner, OidcUser principal) {
        return buildCheckResponse(owner, principal);
    }

    @GetMapping("/check-linkedin")
    public ResponseEntity<java.util.Map<String, Object>> checkLinkedin(@RequestParam String username, @AuthenticationPrincipal OidcUser principal) {
        return buildCheckResponse(service.checkLinkedinOwner(username), principal);
    }

    @GetMapping("/check-github")
    public ResponseEntity<java.util.Map<String, Object>> checkGithub(@RequestParam String username, @AuthenticationPrincipal OidcUser principal) {
        return buildCheckResponse(service.checkGithubOwner(username), principal);
    }

    @GetMapping("/check-leetcode")
    public ResponseEntity<java.util.Map<String, Object>> checkLeetcode(@RequestParam String username, @AuthenticationPrincipal OidcUser principal) {
        return buildCheckResponse(service.checkLeetcodeOwner(username), principal);
    }

    @GetMapping("/check-mail")
    public ResponseEntity<java.util.Map<String, Object>> checkMail(@RequestParam String email, @AuthenticationPrincipal OidcUser principal) {
        return buildMailCheckResponse(service.checkMailOwner(email), principal);
    }

    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(@AuthenticationPrincipal OidcUser principal, @Valid @RequestBody me.dwaragesh.backend.model.dto.OnBoardingRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal);
        return ResponseEntity.ok(service.createProfile(user, request));
    }
}
