package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.service.AsciiArtService;
import me.dwaragesh.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile/pfp")
public class PfpController {

    private final AsciiArtService asciiArtService;
    private final ProfileRepository profileRepository;
    private final UserService userService;

    public PfpController(AsciiArtService asciiArtService, ProfileRepository profileRepository, UserService userService) {
        this.asciiArtService = asciiArtService;
        this.profileRepository = profileRepository;
        this.userService = userService;
    }

    @PostMapping
    public String uploadPfp(
            @AuthenticationPrincipal OidcUser principal,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        User user = userService.findOrCreateFromGoogle(
                principal.getSubject(), principal.getEmail(), principal.getPicture());
        Profile profile = user.getProfile();

        String asciiArtUrl = asciiArtService.processUpload(file, "pfp-" + profile.getProfileId());
        profile.setAsciiArt(asciiArtUrl);
        profileRepository.save(profile);

        return asciiArtUrl;
    }
}