package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.LinkPlatformRequest;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.repository.UserRepository;
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
    public String linkAndSync(
            @AuthenticationPrincipal OidcUser principal,
            @RequestBody LinkPlatformRequest request
    ) {
        User user;
        if (principal != null) {
            user = userService.findOrCreateFromGoogle(
                    principal.getSubject(), principal.getEmail(), principal.getPicture());
        } else {
            user = userService.findOrCreateFromGoogle("mock-sub", "dwarageshc7203@gmail.com", null);
        }
        
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
            profile.setUserName("dwarageshc7203");
            profile.setDesignation("Software Engineer");
            profile = profileRepository.save(profile);
            
            user.setProfile(profile);
            userRepository.save(user);
        }
        
        syncService.syncPlatform(profile, request.platform(), request.externalUsername());
        return "Synced";
    }
}