package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
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
    public List<ProfileResponse> getAllProfiles() {
        return service.getAllProfiles();
    }

    @GetMapping("/api/profile/test-sync/{username}/{platform}/{external}")
    public String testSync(@PathVariable String username, @PathVariable String platform, @PathVariable String external) {
        try {
            me.dwaragesh.backend.model.Profile p = service.getRawProfile(username);
            me.dwaragesh.backend.service.SyncService syncService = org.springframework.web.context.support.WebApplicationContextUtils.getRequiredWebApplicationContext(
                ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest().getServletContext()
            ).getBean(me.dwaragesh.backend.service.SyncService.class);
            syncService.syncPlatform(p, me.dwaragesh.backend.model.enums.Platform.valueOf(platform.toUpperCase()), external);
            return "OK";
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return sw.toString();
        }
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(me.dwaragesh.backend.exception.ProfileNotFoundException.class)
    public org.springframework.http.ResponseEntity<String> handleProfileNotFound(me.dwaragesh.backend.exception.ProfileNotFoundException ex) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
