package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;

import me.dwaragesh.backend.model.Project;

import java.util.List;
import java.util.Map;

public record ProfileResponse(
        String userName,
        String profileName,
        String designation,
        String pin,
        String profileUrl,
        String imageURL,
        String email,
        Integer bannerId,
        List<String> socials,
        List<Badge> badges,
        List<Contest> contests,
        Map<String, me.dwaragesh.backend.model.ProblemStats> problemStats,
        List<Project> projects,
        int anonymousViews,
        java.time.Instant createdAt,

        @com.fasterxml.jackson.annotation.JsonRawValue
        String contributions,

        @com.fasterxml.jackson.annotation.JsonRawValue
        String displayPreferences
) {
}

