package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.LinkPlatformRequest;
import me.dwaragesh.backend.service.SyncService;
import me.dwaragesh.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/platforms")
public class PlatformController {

    private final SyncService syncService;
    private final UserService userService;

    public PlatformController(SyncService syncService, UserService userService) {
        this.syncService = syncService;
        this.userService = userService;
    }

    @PostMapping
    public String linkAndSync(
            @AuthenticationPrincipal OidcUser principal,
            @RequestBody LinkPlatformRequest request
    ) {
        User user = userService.findOrCreateFromGoogle(
                principal.getSubject(), principal.getEmail(), principal.getPicture());
        Profile profile = user.getProfile();
        syncService.syncPlatform(profile, request.platform(), request.externalUsername());
        return "Synced";
    }
}