package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.MeResponse;
import me.dwaragesh.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class UserController {

   @Autowired
    private UserService service;

   @Autowired
   private me.dwaragesh.backend.service.SyncService syncService;

   @GetMapping("/api/me")
    public MeResponse getMe(@AuthenticationPrincipal OidcUser principal) {
       User user = service.findOrCreateFromGoogle(
               principal.getSubject(),
               principal.getEmail(),
               principal.getPicture()
       );
       if (user.getProfile() != null) {
           syncService.syncAllPlatformsAsync(user.getProfile());
       }
       return service.toMeResponse(user);
   }

   @DeleteMapping("/api/me")
   public ResponseEntity<Void> deleteMe(@AuthenticationPrincipal OidcUser principal) {
       User user = service.findOrCreateFromGoogle(
               principal.getSubject(),
               principal.getEmail(),
               principal.getPicture()
       );
       service.deleteUser(user);
       return ResponseEntity.ok().build();
   }

}
