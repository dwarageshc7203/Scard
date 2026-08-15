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

    public void syncPlatform(Profile profile, Platform platform, String externalUsername) {
        PlatformFetcher fetcher = fetchers.get(platform);
        if (fetcher == null) {
            throw new IllegalArgumentException("No fetcher registered for platform: " + platform);
        }
        PlatformSyncResult result = fetcher.fetch(externalUsername);

        upsertContributions(profile, platform, result);
        upsertBadges(profile, platform, result);
        upsertContests(profile, platform, result);
        
        if (result.problemsSolved() != null) {
            if (profile.getProblemsSolved() == null) {
                profile.setProblemsSolved(new java.util.HashMap<>());
            }
            profile.getProblemsSolved().put(platform.name().toUpperCase(), result.problemsSolved());
        }

        profileRepository.save(profile);
    }

    private PlatformSyncResult createMockResult(Platform platform, String externalUsername) {
        List<ContributionData> contributions = new java.util.ArrayList<>();
        java.time.LocalDate today = java.time.LocalDate.now();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 365; i++) {
            java.time.LocalDate date = today.minusDays(i);
            int count = random.nextInt(8) == 0 ? random.nextInt(15) + 1 : 0;
            contributions.add(new ContributionData(date, count));
        }

        List<BadgeData> badges = new java.util.ArrayList<>();
        List<ContestData> contests = new java.util.ArrayList<>();

        Integer problemsSolved = null;

        if (platform == Platform.GITHUB) {
            badges.add(new BadgeData("Pull Shark", "https://github.com", java.time.LocalDate.now()));
            badges.add(new BadgeData("Arctic Code Vault", "https://github.com", java.time.LocalDate.now()));
        } else if (platform == Platform.LEETCODE) {
            badges.add(new BadgeData("Knight", "https://leetcode.com", java.time.LocalDate.now()));
            badges.add(new BadgeData("50 Days Badge", "https://leetcode.com", java.time.LocalDate.now()));
            contests.add(new ContestData("Weekly Contest 350", java.time.LocalDate.now().minusDays(5), 1850));
            contests.add(new ContestData("Biweekly Contest 108", java.time.LocalDate.now().minusDays(12), 1790));
            problemsSolved = 532;
        } else if (platform == Platform.CODEFORCES) {
            badges.add(new BadgeData("Specialist", "https://codeforces.com", java.time.LocalDate.now()));
            contests.add(new ContestData("Codeforces Round 880", java.time.LocalDate.now().minusDays(8), 1540));
            problemsSolved = 210;
        }

        return new PlatformSyncResult(contributions, badges, contests, problemsSolved);
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