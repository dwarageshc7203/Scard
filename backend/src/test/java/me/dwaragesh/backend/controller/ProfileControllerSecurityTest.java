package me.dwaragesh.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.springframework.context.annotation.Import;

@WebMvcTest({ProfileController.class, PublicProfileController.class})
@Import({me.dwaragesh.backend.config.SecurityConfig.class, me.dwaragesh.backend.TestScardApplication.class})
public class ProfileControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private me.dwaragesh.backend.service.ProfileService profileService;

    @MockBean
    private me.dwaragesh.backend.service.UserService userService;

    @MockBean
    private me.dwaragesh.backend.service.SyncService syncService;

    @Test
    public void unauthenticatedPublicProfile_ReturnsOk() throws Exception {
        me.dwaragesh.backend.model.dto.PublicProfileResponse mockResponse = new me.dwaragesh.backend.model.dto.PublicProfileResponse(
            "testuser", "Test", null, null, null, null, null, java.util.List.of("github:test"), null, null, null, null, 0, java.time.Instant.now(), null, null
        );
        org.mockito.Mockito.when(profileService.getPublicProfileAndTrackView(org.mockito.ArgumentMatchers.eq("testuser"), org.mockito.ArgumentMatchers.any())).thenReturn(mockResponse);

        mockMvc.perform(get("/api/profile/testuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").doesNotExist())
                .andExpect(jsonPath("$.socials[?(@ =~ /(?i)^mail:.*/)]").isEmpty());
    }

    @Test
    public void unauthenticatedCheckMail_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/profile/check-mail").param("email", "test@test.com"))
                .andExpect(status().isOk());
    }

    @Test
    public void unauthenticatedAnalytics_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/profile/analytics"))
                .andExpect(status().isUnauthorized()); // Or 403 / 302 depending on config, but not 200
    }

    @Test
    public void authenticatedAnalytics_ReturnsOk() throws Exception {
        // Mocking OIDC User is necessary because the controller explicitly checks for @AuthenticationPrincipal OidcUser
        mockMvc.perform(get("/api/profile/analytics").with(oidcLogin()))
                .andExpect(status().isOk());
    }
}
