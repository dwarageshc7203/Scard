package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;
import me.dwaragesh.backend.model.Contribution;
import java.util.List;

public record ProfileResponse(
        String userName,
        String designation,
        String profileURL,
        String asciiArt,
        List<Badge> badges,
        List<Contest> contests,
        List<Contribution> contributions
) {
}

