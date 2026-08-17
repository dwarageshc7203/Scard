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

    @Autowired
    private ProfileService service;

    @GetMapping("/api/profile/{userName}")
    public ProfileResponse getPublicProfile(@PathVariable String userName, @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.core.oidc.user.OidcUser principal) {
        String googleId = principal != null ? principal.getSubject() : null;
        return service.getProfileAndTrackView(userName, googleId);
    }

    @GetMapping("/api/profiles")
    public List<me.dwaragesh.backend.model.dto.ProfileSummary> getAllProfiles() {
        return service.getAllProfiles();
    }



    @org.springframework.web.bind.annotation.ExceptionHandler(me.dwaragesh.backend.exception.ProfileNotFoundException.class)
    public org.springframework.http.ResponseEntity<String> handleProfileNotFound(me.dwaragesh.backend.exception.ProfileNotFoundException ex) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
