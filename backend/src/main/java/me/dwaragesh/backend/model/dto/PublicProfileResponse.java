package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;
import me.dwaragesh.backend.model.Project;
import me.dwaragesh.backend.model.ProblemStats;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public record PublicProfileResponse(
        String userName,
        String profileName,
        String designation,
        String pin,
        String profileUrl,
        String imageURL,
        Integer bannerId,
        List<String> socials,
        List<Badge> badges,
        List<Contest> contests,
        Map<String, ProblemStats> problemStats,
        List<Project> projects,
        Integer anonymousViews,
        Instant createdAt,
        @com.fasterxml.jackson.annotation.JsonRawValue String contributions,
        @com.fasterxml.jackson.annotation.JsonRawValue String displayPreferences
) {}
