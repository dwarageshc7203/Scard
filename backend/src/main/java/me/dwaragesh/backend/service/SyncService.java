package me.dwaragesh.backend.service;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.exception.ProfileNotFoundException;
import me.dwaragesh.backend.fetcher.PlatformFetcher;
import me.dwaragesh.backend.fetcher.dto.BadgeData;
import me.dwaragesh.backend.fetcher.dto.ContestData;
import me.dwaragesh.backend.fetcher.dto.ContributionData;
import me.dwaragesh.backend.fetcher.dto.PlatformSyncResult;
import me.dwaragesh.backend.model.*;
import me.dwaragesh.backend.model.enums.Platform;
import me.dwaragesh.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class SyncService {

    @org.springframework.scheduling.annotation.Async("syncExecutor")
    public void syncAllPlatformsAsync(Profile profile) {
        if (profile == null || profile.getSocials() == null) return;

        // Rate-limit: only sync if last sync was more than 1 hour ago
        if (profile.getLastSyncedAt() != null &&
                Duration.between(profile.getLastSyncedAt(), Instant.now()).toHours() < 1) {
            return;
        }

        for (String social : profile.getSocials()) {
            if (social.contains(":")) {
                String[] parts = social.split(":", 2);
                try {
                    Platform platform = Platform.valueOf(parts[0].toUpperCase());
                    String externalUsername = parts[1];
                    me.dwaragesh.backend.util.ValidationUtils.validateExternalUsername(externalUsername);
                    self.syncPlatform(profile, platform, externalUsername);
                } catch (IllegalArgumentException e) {
                    // Ignore socials that are not valid Sync Platforms (like linkedin, mail, twitter)
                } catch (Exception e) {
                    log.warn("Failed to sync platform {} during background sync: {}", parts[0], e.getMessage());
                }
            }
        }
    }

    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private SyncService self;

    private final Map<Platform, PlatformFetcher> fetchers;
    private final ProfileRepository profileRepository;
    private final BadgeRepository badgeRepository;
    private final ContestRepository contestRepository;
    private final ContributionRepository contributionRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public SyncService(
            List<PlatformFetcher> fetcherList,
            ProfileRepository profileRepository,
            BadgeRepository badgeRepository,
            ContestRepository contestRepository,
            ContributionRepository contributionRepository
    ) {
        this.fetchers = fetcherList.stream()
                .collect(Collectors.toMap(PlatformFetcher::platform, Function.identity()));
        this.profileRepository = profileRepository;
        this.badgeRepository = badgeRepository;
        this.contestRepository = contestRepository;
        this.contributionRepository = contributionRepository;
    }

    @org.springframework.transaction.annotation.Transactional
    public void syncPlatform(Profile detachedProfile, Platform platform, String externalUsername) {
        Profile profile = profileRepository.findById(detachedProfile.getProfileId())
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
        PlatformFetcher fetcher = fetchers.get(platform);
        if (fetcher == null) {
            throw new IllegalArgumentException("No fetcher registered for platform: " + platform);
        }
        PlatformSyncResult result = fetcher.fetch(externalUsername);

        try {
            upsertContributions(profile, platform, result);
            upsertBadges(profile, platform, result);
            upsertContests(profile, platform, result);
            
            if (result.problemsSolved() != null) {
                if (profile.getProblemStats() == null) {
                    profile.setProblemStats(new java.util.HashMap<>());
                }
                ProblemStats stats = new ProblemStats(
                        result.problemsSolved().total(),
                        result.problemsSolved().easy(),
                        result.problemsSolved().medium(),
                        result.problemsSolved().hard()
                );
                profile.getProblemStats().put(platform.name().toUpperCase(), stats);
            }

            profile.setLastSyncedAt(Instant.now());
            profileRepository.save(profile);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Concurrent sync (e.g. background sync + manual sync) collided.
            // Safely ignore, the other thread successfully updated the platform data.
            org.slf4j.LoggerFactory.getLogger(SyncService.class)
                .info("Ignored concurrent sync collision for platform: {}", platform);
        }
    }


    private void upsertContributions(Profile profile, Platform platform, PlatformSyncResult result) {
        // Wipe existing rows for this platform, then reinsert — idempotent and clean
        contributionRepository.deleteByProfileAndPlatform(profile, platform);

        // instead of one INSERT per record (N+1 writes).
        List<Contribution> toSave = result.contributions().stream()
                .filter(c -> c.count() > 0)
                .map(c -> {
                    Contribution contribution = new Contribution();
                    contribution.setProfile(profile);
                    contribution.setPlatform(platform);
                    contribution.setDate(c.date());
                    contribution.setCount(c.count());
                    return contribution;
                })
                .collect(Collectors.toList());
        contributionRepository.saveAll(toSave);
    }

    private void upsertBadges(Profile profile, Platform platform, PlatformSyncResult result) {
        List<Badge> existing = badgeRepository.findByProfileProfileId(profile.getProfileId()).stream()
                .filter(b -> platform.equals(b.getPlatform()))
                .toList();
        badgeRepository.deleteAll(existing);

        List<Badge> toSave = result.badges().stream().map(b -> {
            Badge badge = new Badge();
            badge.setProfile(profile);
            badge.setPlatform(platform);
            badge.setBadgeName(b.badgeName());
            badge.setBadgeURL(b.badgeURL());
            badge.setBadgeDate(b.badgeDate());
            return badge;
        }).collect(Collectors.toList());
        badgeRepository.saveAll(toSave);
    }

    private void upsertContests(Profile profile, Platform platform, PlatformSyncResult result) {
        List<Contest> existing = contestRepository.findByProfileProfileId(profile.getProfileId()).stream()
                .filter(c -> platform.equals(c.getPlatform()))
                .toList();
        contestRepository.deleteAll(existing);

        List<Contest> toSave = result.contests().stream().map(c -> {
            Contest contest = new Contest();
            contest.setProfile(profile);
            contest.setPlatform(platform);
            contest.setContestName(c.contestName());
            contest.setContestDate(c.contestDate());
            contest.setContestRating(c.contestRating());
            return contest;
        }).collect(Collectors.toList());
        contestRepository.saveAll(toSave);
    }
}