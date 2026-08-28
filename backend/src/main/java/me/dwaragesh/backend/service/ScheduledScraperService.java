package me.dwaragesh.backend.service;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduledScraperService {

    private final ProfileRepository profileRepository;
    private final SyncService syncService;

    public ScheduledScraperService(ProfileRepository profileRepository, SyncService syncService) {
        this.profileRepository = profileRepository;
        this.syncService = syncService;
    }

    @Scheduled(fixedRate = 900000)
    public void syncAllProfiles() {
        java.time.Instant cutoff = java.time.Instant.now().minus(java.time.Duration.ofHours(1));
        List<Profile> profiles = profileRepository.findStale(cutoff, org.springframework.data.domain.PageRequest.of(0, 500));
        for (Profile profile : profiles) {
            syncService.syncAllPlatformsAsync(profile);
        }
    }
}
