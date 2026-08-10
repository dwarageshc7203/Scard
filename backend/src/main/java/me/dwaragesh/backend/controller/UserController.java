package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.MeResponse;
import me.dwaragesh.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

   @Autowired
    private UserService service;

   @GetMapping("/api/me")
    public MeResponse getMe(@AuthenticationPrincipal OidcUser principal) {
       User user = service.findOrCreateFromGoogle(
               principal.getSubject(),
               principal.getEmail(),
               principal.getPicture()
       );
       return service.toMeResponse(user);
   }

}
