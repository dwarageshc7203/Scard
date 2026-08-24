package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.LinkPlatformRequest;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.repository.UserRepository;
import me.dwaragesh.backend.service.SyncService;
import me.dwaragesh.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/platforms")
public class PlatformController {

    private final SyncService syncService;
    private final UserService userService;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public PlatformController(
            SyncService syncService,
            UserService userService,
            ProfileRepository profileRepository,
            UserRepository userRepository
    ) {
        this.syncService = syncService;
        this.userService = userService;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<String> linkAndSync(
            @AuthenticationPrincipal OidcUser principal,
            @jakarta.validation.Valid @RequestBody LinkPlatformRequest request
    ) {
        User user;
        if (principal != null) {
            user = userService.findOrCreateFromGoogle(
                    principal.getSubject(), principal.getEmail(), principal.getPicture());
        } else {
            // Unauthenticated request — reject instead of using a hardcoded mock user
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Profile profile = user.getProfile();
        if (profile == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Profile not found. Please create a profile first.");
        }

        try {
            String externalUsername = request.externalUsername();
            me.dwaragesh.backend.util.ValidationUtils.validateExternalUsername(externalUsername);
            syncService.syncPlatform(profile, request.platform(), externalUsername);
            return ResponseEntity.ok("Synced");
        } catch (PlatformFetchException e) {
            // Return 422 with the fetch error message so the frontend can display it
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body("Sync failed: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}