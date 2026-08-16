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

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SyncService {

    @org.springframework.scheduling.annotation.Async
    public void syncAllPlatformsAsync(Profile profile) {
        if (profile == null || profile.getSocials() == null) return;
        for (String social : profile.getSocials()) {
            if (social.contains(":")) {
                String[] parts = social.split(":", 2);
                try {
                    Platform platform = Platform.valueOf(parts[0].toUpperCase());
                    String externalUsername = parts[1];
                    syncPlatform(profile, platform, externalUsername);
                } catch (IllegalArgumentException e) {
                    // Ignore socials that are not valid Sync Platforms (like linkedin, mail, twitter)
                } catch (Exception e) {
                    // Log fetch errors during background sync
                    System.err.println("Failed to sync platform for " + parts[0] + ": " + e.getMessage());
                }
            }
        }
    }

    private final Map<Platform, PlatformFetcher> fetchers;
    private final ProfileRepository profileRepository;
    private final BadgeRepository badgeRepository;
    private final ContestRepository contestRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public SyncService(
            List<PlatformFetcher> fetcherList,
            ProfileRepository profileRepository,
            BadgeRepository badgeRepository,
            ContestRepository contestRepository
    ) {
        this.fetchers = fetcherList.stream()
                .collect(Collectors.toMap(PlatformFetcher::platform, Function.identity()));
        this.profileRepository = profileRepository;
        this.badgeRepository = badgeRepository;
        this.contestRepository = contestRepository;
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

        profileRepository.save(profile);
    }


    private void upsertContributions(Profile profile, Platform platform, PlatformSyncResult result) {
        try {
            List<Map<String, Object>> allContributions;
            String currentJson = profile.getHeatmapJson();
            if (currentJson != null && !currentJson.trim().isEmpty() && !currentJson.equals("[]")) {
                allContributions = mapper.readValue(currentJson, new TypeReference<List<Map<String, Object>>>() {});
            } else {
                allContributions = new java.util.ArrayList<>();
            }

            // Remove old contributions for this platform
            allContributions.removeIf(c -> platform.name().equals(c.get("platform")));

            // Add new contributions
            for (ContributionData c : result.contributions()) {
                if (c.count() > 0) {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("platform", platform.name());
                    map.put("contributionDate", c.date().toString());
                    map.put("count", c.count());
                    allContributions.add(map);
                }
            }

            profile.setHeatmapJson(mapper.writeValueAsString(allContributions));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update heatmap json", e);
        }
    }

    private void upsertBadges(Profile profile, Platform platform, PlatformSyncResult result) {
        // badges don't have a natural unique key to upsert against reliably yet —
        // simplest correct approach for now: wipe this platform's badges and reinsert
        List<Badge> existing = badgeRepository.findByProfileProfileId(profile.getProfileId()).stream()
                .filter(b -> platform.equals(b.getPlatform()))
                .toList();
        badgeRepository.deleteAll(existing);

        result.badges().forEach(b -> {
            Badge badge = new Badge();
            badge.setProfile(profile);
            badge.setPlatform(platform);
            badge.setBadgeName(b.badgeName());
            badge.setBadgeURL(b.badgeURL());
            badge.setBadgeDate(b.badgeDate());
            badgeRepository.save(badge);
        });
    }

    private void upsertContests(Profile profile, Platform platform, PlatformSyncResult result) {
        List<Contest> existing = contestRepository.findByProfileProfileId(profile.getProfileId()).stream()
                .filter(c -> platform.equals(c.getPlatform()))
                .toList();
        contestRepository.deleteAll(existing);

        result.contests().forEach(c -> {
            Contest contest = new Contest();
            contest.setProfile(profile);
            contest.setPlatform(platform);
            contest.setContestName(c.contestName());
            contest.setContestDate(c.contestDate());
            contest.setContestRating(c.contestRating());
            contestRepository.save(contest);
        });
    }
}