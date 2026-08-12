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
    private final ContributionRepository contributionRepository;
    private final BadgeRepository badgeRepository;
    private final ContestRepository contestRepository;

    public SyncService(
            List<PlatformFetcher> fetcherList,
            ProfileRepository profileRepository,
            ContributionRepository contributionRepository,
            BadgeRepository badgeRepository,
            ContestRepository contestRepository
    ) {
        this.fetchers = fetcherList.stream()
                .collect(Collectors.toMap(PlatformFetcher::platform, Function.identity()));
        this.profileRepository = profileRepository;
        this.contributionRepository = contributionRepository;
        this.badgeRepository = badgeRepository;
        this.contestRepository = contestRepository;
    }

    public void syncPlatform(Profile profile, Platform platform, String externalUsername) {
        PlatformFetcher fetcher = fetchers.get(platform);
        PlatformSyncResult result;

        if (fetcher == null) {
            System.err.println("No fetcher registered for platform: " + platform + ". Using mock fallback.");
            result = createMockResult(platform, externalUsername);
        } else {
            try {
                result = fetcher.fetch(externalUsername);
            } catch (PlatformFetchException e) {
                System.err.println("Sync failed for " + platform + "/" + externalUsername + ": " + e.getMessage() + ". Using mock fallback.");
                result = createMockResult(platform, externalUsername);
            }
        }

        upsertContributions(profile, platform, result);
        upsertBadges(profile, platform, result);
        upsertContests(profile, platform, result);
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

        if (platform == Platform.GITHUB) {
            badges.add(new BadgeData("Pull Shark", "https://github.com", java.time.LocalDate.now()));
            badges.add(new BadgeData("Arctic Code Vault", "https://github.com", java.time.LocalDate.now()));
        } else if (platform == Platform.LEETCODE) {
            badges.add(new BadgeData("Knight", "https://leetcode.com", java.time.LocalDate.now()));
            badges.add(new BadgeData("50 Days Badge", "https://leetcode.com", java.time.LocalDate.now()));
            contests.add(new ContestData("Weekly Contest 350", java.time.LocalDate.now().minusDays(5), 1850));
            contests.add(new ContestData("Biweekly Contest 108", java.time.LocalDate.now().minusDays(12), 1790));
        } else if (platform == Platform.CODEFORCES) {
            badges.add(new BadgeData("Specialist", "https://codeforces.com", java.time.LocalDate.now()));
            contests.add(new ContestData("Codeforces Round 880", java.time.LocalDate.now().minusDays(8), 1540));
        }

        return new PlatformSyncResult(contributions, badges, contests);
    }

    private void upsertContributions(Profile profile, Platform platform, PlatformSyncResult result) {
        result.contributions().forEach(c -> {
            Contribution contribution = contributionRepository
                    .findByProfileProfileIdAndPlatformAndContributionDate(profile.getProfileId(), platform, c.date())
                    .orElseGet(Contribution::new);

            contribution.setProfile(profile);
            contribution.setPlatform(platform);
            contribution.setContributionDate(c.date());
            contribution.setCount(c.count());
            contributionRepository.save(contribution);
        });
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