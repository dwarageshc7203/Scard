package me.dwaragesh.backend;

import me.dwaragesh.backend.exception.ProfileNotFoundException;
import me.dwaragesh.backend.exception.UsernameTakenException;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.OnBoardingRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.repository.ProfileViewRepository;
import me.dwaragesh.backend.repository.UserRepository;
import me.dwaragesh.backend.service.ProfileService;
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
public class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileViewRepository profileViewRepository;

    @InjectMocks
    private ProfileService profileService;

    private User sampleUser;
    private Profile sampleProfile;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setUserId(UUID.randomUUID());
        sampleUser.setEmail("test@test.com");

        sampleProfile = new Profile();
        sampleProfile.setProfileId(1);
        sampleProfile.setUserName("johndoe");
        sampleProfile.setProfileName("John Doe");
        sampleProfile.setDesignation("Developer");
        sampleProfile.setUser(sampleUser);
    }

    @Test
    void testGetProfile_Success() {
        when(profileRepository.findFirstByUserName("johndoe")).thenReturn(Optional.of(sampleProfile));

        ProfileResponse response = profileService.getProfile("johndoe");

        assertNotNull(response);
        assertEquals("johndoe", response.userName());
        assertEquals("John Doe", response.profileName());
    }

    @Test
    void testGetProfile_NotFound() {
        when(profileRepository.findFirstByUserName("unknown")).thenReturn(Optional.empty());

        assertThrows(ProfileNotFoundException.class, () -> {
            profileService.getProfile("unknown");
        });
    }

    @Test
    void testCreateProfile_Success() {
        OnBoardingRequest request = new OnBoardingRequest("newuser", "New User", "Engineer");

        when(profileRepository.findByUser(sampleUser)).thenReturn(null);
        when(profileRepository.existsByUserNameIgnoreCase("newuser")).thenReturn(false);
        when(profileRepository.save(any(Profile.class))).thenAnswer(i -> {
            Profile p = (Profile) i.getArguments()[0];
            p.setProfileId(2);
            return p;
        });

        ProfileResponse response = profileService.createProfile(sampleUser, request);

        assertNotNull(response);
        assertEquals("newuser", response.userName());
        assertEquals("Engineer", response.designation());
    }

    @Test
    void testCreateProfile_UsernameTaken() {
        OnBoardingRequest request = new OnBoardingRequest("takenuser", "Taken User", "Engineer");

        when(profileRepository.findByUser(sampleUser)).thenReturn(null);
        when(profileRepository.existsByUserNameIgnoreCase("takenuser")).thenReturn(true);

        assertThrows(UsernameTakenException.class, () -> {
            profileService.createProfile(sampleUser, request);
        });
    }
}
