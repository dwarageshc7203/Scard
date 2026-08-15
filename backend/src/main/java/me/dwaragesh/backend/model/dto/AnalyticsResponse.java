package me.dwaragesh.backend.model.dto;

import java.util.List;

public record AnalyticsResponse(
        int anonymousViews,
        List<ViewerDto> recentViewers
) {
    public record ViewerDto(
            String userName,
            String displayName,
            String imageURL,
            java.time.Instant viewedAt
    ) {}
}
