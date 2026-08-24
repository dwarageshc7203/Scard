package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.service.ImageUploadService;
import me.dwaragesh.backend.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile/pfp")
public class PfpController {

    private final ImageUploadService imageUploadService;
    private final ProfileRepository profileRepository;
    private final UserService userService;

    public PfpController(ImageUploadService imageUploadService, ProfileRepository profileRepository, UserService userService) {
        this.imageUploadService = imageUploadService;
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

        String oldImageUrl = profile.getCustomImageUrl();
        String imageUrl = imageUploadService.saveRawImage(file, "pfp-" + profile.getProfileId());
        
        if (oldImageUrl != null && !oldImageUrl.equals(imageUrl)) {
            imageUploadService.deleteImage(oldImageUrl);
        }
        
        profile.setCustomImageUrl(imageUrl);
        profileRepository.save(profile);
        return imageUrl;
    }

    @DeleteMapping
    public void deletePfp(@AuthenticationPrincipal OidcUser principal) {
        User user = userService.findOrCreateFromGoogle(
                principal.getSubject(), principal.getEmail(), principal.getPicture());
        Profile profile = user.getProfile();
        String oldImageUrl = profile.getCustomImageUrl();
        if (oldImageUrl != null) {
            imageUploadService.deleteImage(oldImageUrl);
        }
        profile.setCustomImageUrl(null);
        profileRepository.save(profile);
    }
}