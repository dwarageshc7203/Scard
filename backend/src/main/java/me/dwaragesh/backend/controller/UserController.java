package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.MeResponse;
import me.dwaragesh.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService service;
    private final me.dwaragesh.backend.service.SyncService syncService;

    public UserController(UserService service, me.dwaragesh.backend.service.SyncService syncService) {
        this.service = service;
        this.syncService = syncService;
    }

    @GetMapping("/me")
    public MeResponse getMe(@AuthenticationPrincipal OidcUser principal) {
        User user = service.findOrCreateFromGoogle(principal);

        return service.toMeResponse(user);
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal OidcUser principal) {
        User user = service.findOrCreateFromGoogle(principal);
        service.deleteUser(user);
        return ResponseEntity.ok().build();
    }
}
