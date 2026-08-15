package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contest;


import me.dwaragesh.backend.model.Project;

import java.util.List;
import java.util.Map;

public record PatchProfileRequest(

        String designation,
        String profileURL,
        String userName,
        String profileName,
        String email,
        String asciiArt,
        Integer bannerId,
        List<String> socials,
        List<Badge> badges,
        List<Contest> contests,
        Map<String, Integer> problemsSolved,
        List<Project> projects

) {
}
