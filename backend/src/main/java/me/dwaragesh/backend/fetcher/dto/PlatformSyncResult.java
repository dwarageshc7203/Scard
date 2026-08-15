package me.dwaragesh.backend.fetcher.dto;

import java.util.List;

public record PlatformSyncResult(

        List<ContributionData> contributions,
        List<BadgeData> badges,
        List<ContestData> contests,
        ProblemStatsData problemsSolved
) {
}
