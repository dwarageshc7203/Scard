package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PublicProfileController {

    private final ProfileService service;

    public PublicProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/api/profile/{userName}")
    public ProfileResponse getPublicProfile(
            @PathVariable String userName,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.core.oidc.user.OidcUser principal) {
        String googleId = principal != null ? principal.getSubject() : null;

        return service.getPublicProfileAndTrackView(userName, googleId);
    }

    @GetMapping("/api/profiles")
    public org.springframework.data.domain.Page<me.dwaragesh.backend.model.dto.ProfileSummary> getAllProfiles(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "30") int size
    ) {
        return service.getAllProfiles(org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100)));
    }

    @GetMapping("/api/profile/{userName}/contributions")
    public org.springframework.data.domain.Page<me.dwaragesh.backend.model.Contribution> getContributions(
            @PathVariable String userName,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "0") int page,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "30") int size
    ) {
        return service.getPaginatedContributions(userName, org.springframework.data.domain.PageRequest.of(page, Math.min(size, 100)));
    }




}
