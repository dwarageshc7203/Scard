package me.dwaragesh.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import me.dwaragesh.backend.model.Contribution;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.enums.Platform;
import me.dwaragesh.backend.repository.ContributionRepository;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class MigrationRunner {

    private final ProfileRepository profileRepository;
    private final ContributionRepository contributionRepository;
    private final ObjectMapper mapper;

    public MigrationRunner(ProfileRepository profileRepository, ContributionRepository contributionRepository) {
        this.profileRepository = profileRepository;
        this.contributionRepository = contributionRepository;
        this.mapper = new ObjectMapper();
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateHeatmapJsonToContributionTable() {
        // LOW-9: Skip the full table scan if migration is already complete.
        // Once all heatmapJson columns are cleared this becomes a cheap COUNT query.
        long remaining = profileRepository.countByHeatmapJsonNot("[]");
        if (remaining == 0) {
            log.debug("Heatmap migration already complete — nothing to do.");
            return;
        }
        log.info("Migrating heatmapJson for {} profiles...", remaining);

        List<Profile> profiles = profileRepository.findAll();
        for (Profile profile : profiles) {
            String json = profile.getHeatmapJson();
            if (json != null && !json.trim().isEmpty() && !json.equals("[]")) {
                try {
                    List<Map<String, Object>> records = mapper.readValue(json, new TypeReference<>() {});
                    for (Map<String, Object> record : records) {
                        try {
                            Platform platform = Platform.valueOf((String) record.get("platform"));
                            LocalDate date = LocalDate.parse((String) record.get("contributionDate"));
                            int count = record.get("count") != null ? (Integer) record.get("count") : 0;

                            if (count > 0 && !contributionRepository.existsByProfileAndPlatformAndDate(profile, platform, date)) {
                                Contribution c = new Contribution();
                                c.setProfile(profile);
                                c.setPlatform(platform);
                                c.setDate(date);
                                c.setCount(count);
                                contributionRepository.save(c);
                            }
                        } catch (Exception e) {
                            log.warn("Skipping malformed contribution record for profile {}", profile.getProfileId());
                        }
                    }
                    
                    // After successful migration, clear the old blob to free up space
                    profile.setHeatmapJson("[]");
                    profileRepository.save(profile);

                } catch (Exception e) {
                    log.error("Failed to migrate heatmapJson for profile {}: {}", profile.getProfileId(), e.getMessage());
                }
            }
        }
    }
}
