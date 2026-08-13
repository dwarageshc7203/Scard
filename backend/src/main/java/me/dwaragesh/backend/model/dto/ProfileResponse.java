package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;

import java.util.List;

public record ProfileResponse(
        String userName,
        String designation,
        String profileURL,
        String asciiArt,
        List<Badge> badges,
        List<Contest> contests,
        @com.fasterxml.jackson.annotation.JsonRawValue
        String contributions
) {
}

