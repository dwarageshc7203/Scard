package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;


import java.util.List;

public record PatchProfileRequest(

        String designation,
        String profileURL,
        String userName,
        String email,
        String asciiArt,
        List<Badge> badges,
        List<Contest> contests

) {
}
