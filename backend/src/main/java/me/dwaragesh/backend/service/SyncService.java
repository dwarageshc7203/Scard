package me.dwaragesh.backend.service;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.exception.ProfileNotFoundException;
import me.dwaragesh.backend.fetcher.PlatformFetcher;
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
        if (fetcher == null) {
            throw new IllegalArgumentException("No fetcher registered for platform: " + platform);
        }

        PlatformSyncResult result;
        try {
            result = fetcher.fetch(externalUsername);
        } catch (PlatformFetchException e) {
            // don't crash the whole sync — log and bail on this platform only
            System.err.println("Sync failed for " + platform + "/" + externalUsername + ": " + e.getMessage());
            return;
        }

        upsertContributions(profile, platform, result);
        upsertBadges(profile, platform, result);
        upsertContests(profile, platform, result);
    }

    private void upsertContributions(Profile profile, Platform platform, PlatformSyncResult result) {
        result.contributions().forEach(c -> {
            Contribution contribution = contributionRepository
                    .findByProfileProfileIdAndPlatformAndContributionDate(profile.getProfileId(), platform.name(), c.date())
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
                .filter(b -> platform.name().equals(b.getPlatform()))
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
                .filter(c -> platform.name().equals(c.getPlatform()))
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