package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.Project;

import java.util.List;

public record PatchProfileRequest(

        String designation,
        String profileUrl,
        String userName,
        String profileName,
        String email,
        String asciiArt,
        Integer bannerId,
        List<String> socials,
        List<Project> projects,
        String displayPreferences

) {
}
