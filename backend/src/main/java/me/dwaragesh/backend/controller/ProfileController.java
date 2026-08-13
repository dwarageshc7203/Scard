package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.OnBoardingRequest;
import me.dwaragesh.backend.model.dto.PatchProfileRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.service.ProfileService;
import me.dwaragesh.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService service;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ProfileResponse> createProfile(@AuthenticationPrincipal OidcUser principal, @RequestBody OnBoardingRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getName(), principal.getPicture());
        return new ResponseEntity<>(service.createProfile(user, request), HttpStatus.CREATED);
    }

    @PatchMapping()
    public ResponseEntity<ProfileResponse> patchProfile(@AuthenticationPrincipal OidcUser principal, @RequestBody PatchProfileRequest request) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findOrCreateFromGoogle(principal.getSubject(), principal.getName(), principal.getPicture());
        return ResponseEntity.ok(service.patchProfile(user, request));
    }

}
