package me.dwaragesh.backend.service;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.fetcher.PlatformFetcher;
import me.dwaragesh.backend.fetcher.dto.PlatformSyncResult;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.enums.Platform;
import me.dwaragesh.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class SyncServiceTest {

    private PlatformFetcher mockFetcher;
    private ProfileRepository profileRepository;
    private ContributionRepository contributionRepository;
    private BadgeRepository badgeRepository;
    private ContestRepository contestRepository;
    private SyncService syncService;

    @BeforeEach
    void setUp() {
        mockFetcher = mock(PlatformFetcher.class);
        when(mockFetcher.platform()).thenReturn(Platform.GITHUB);

        profileRepository = mock(ProfileRepository.class);
        contributionRepository = mock(ContributionRepository.class);
        badgeRepository = mock(BadgeRepository.class);
        contestRepository = mock(ContestRepository.class);

        syncService = new SyncService(
                List.of(mockFetcher),
                profileRepository,
                contributionRepository,
                badgeRepository,
                contestRepository
        );
    }

    @Test
    void syncPlatform_WithUnregisteredPlatform_ThrowsIllegalArgumentException() {
        Profile profile = new Profile();
        assertThrows(IllegalArgumentException.class, () -> 
            syncService.syncPlatform(profile, Platform.LEETCODE, "testuser")
        );
    }

    @Test
    void syncPlatform_WhenFetcherThrows_PropagatesException() {
        Profile profile = new Profile();
        when(mockFetcher.fetch("invalid_user"))
                .thenThrow(new PlatformFetchException("Fetch failed", new RuntimeException("401 Unauthorized")));

        assertThrows(PlatformFetchException.class, () -> 
            syncService.syncPlatform(profile, Platform.GITHUB, "invalid_user")
        );
    }

    @Test
    void syncPlatform_WhenFetcherSucceeds_SavesData() {
        Profile profile = new Profile();
        profile.setProfileId(1);
        PlatformSyncResult result = new PlatformSyncResult(
                List.of(new me.dwaragesh.backend.fetcher.dto.ContributionData(java.time.LocalDate.now(), 5)),
                List.of(),
                List.of()
        );
        when(mockFetcher.fetch("valid_user")).thenReturn(result);

        syncService.syncPlatform(profile, Platform.GITHUB, "valid_user");

        verify(contributionRepository, atLeastOnce()).findByProfileProfileIdAndPlatformAndContributionDate(anyInt(), any(Platform.class), any());
        verify(badgeRepository, times(1)).findByProfileProfileId(1);
        verify(contestRepository, times(1)).findByProfileProfileId(1);
    }
}
