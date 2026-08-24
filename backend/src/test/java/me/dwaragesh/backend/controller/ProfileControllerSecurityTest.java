package me.dwaragesh.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({ProfileController.class, PublicProfileController.class})
public class ProfileControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private me.dwaragesh.backend.service.ProfileService profileService;

    @MockBean
    private me.dwaragesh.backend.service.SyncService syncService;

    @Test
    public void unauthenticatedPublicProfile_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/profile/testuser"))
                .andExpect(status().isOk());
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
    @WithMockUser
    public void authenticatedAnalytics_ReturnsOk() throws Exception {
        // Just verify it doesn't fail on authentication
        // Might fail with 500 or 400 depending on mock, but auth passes
        mockMvc.perform(get("/api/profile/analytics"))
                .andExpect(status().isOk());
    }
}
