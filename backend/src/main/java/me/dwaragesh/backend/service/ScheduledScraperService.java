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
        List<Profile> profiles = profileRepository.findAll();
        for (Profile profile : profiles) {
            syncService.syncAllPlatformsAsync(profile);
        }
    }
}
