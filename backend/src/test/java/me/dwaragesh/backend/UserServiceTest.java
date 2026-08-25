package me.dwaragesh.backend;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.dto.MeResponse;
import me.dwaragesh.backend.repository.UserRepository;
import me.dwaragesh.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setUserId(UUID.randomUUID());
        sampleUser.setGoogleId("google-123");
        sampleUser.setEmail("test@test.com");
        sampleUser.setImageURL("http://image.url");
    }

    @Test
    void testFindOrCreateFromGoogle_ExistingGoogleId() {
        when(userRepository.findFirstByGoogleId("google-123")).thenReturn(Optional.of(sampleUser));

        User result = userService.findOrCreateFromGoogle("google-123", "test@test.com", "http://image.url");
        
        assertNotNull(result);
        assertEquals("google-123", result.getGoogleId());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testFindOrCreateFromGoogle_NewUser() {
        when(userRepository.findFirstByGoogleId("new-google-id")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("new@test.com")).thenReturn(Optional.empty());
        
        User newUser = new User();
        newUser.setGoogleId("new-google-id");
        newUser.setEmail("new@test.com");
        
        when(userRepository.save(any(User.class))).thenReturn(newUser);

        User result = userService.findOrCreateFromGoogle("new-google-id", "new@test.com", "http://image.url");
        
        assertNotNull(result);
        assertEquals("new-google-id", result.getGoogleId());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testToMeResponse_WithProfile() {
        Profile profile = new Profile();
        profile.setUserName("testUser123");
        sampleUser.setProfile(profile);

        MeResponse response = userService.toMeResponse(sampleUser);

        assertNotNull(response);
        assertTrue(response.hasProfile());
        assertEquals("testUser123", response.userName());
        assertEquals("https://google.com/avatar", response.imageURL());
    }

    @Test
    void testToMeResponse_WithoutProfile() {
        MeResponse response = userService.toMeResponse(sampleUser);

        assertNotNull(response);
        assertFalse(response.hasProfile());
        assertNull(response.userName());
    }
}
