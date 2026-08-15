package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;

import me.dwaragesh.backend.model.Project;

import java.util.List;
import java.util.Map;

public record ProfileResponse(
        String userName,
        String designation,
        String profileURL,
        String asciiArt,
        Integer bannerId,
        List<String> socials,
        List<Badge> badges,
        List<Contest> contests,
        Map<String, Integer> problemsSolved,
        List<Project> projects,
        int anonymousViews,

        @com.fasterxml.jackson.annotation.JsonRawValue
        String contributions
) {
}

