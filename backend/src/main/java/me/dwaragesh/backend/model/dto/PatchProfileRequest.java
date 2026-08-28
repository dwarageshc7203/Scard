package me.dwaragesh.backend.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import me.dwaragesh.backend.model.Project;

import java.util.List;

public record PatchProfileRequest(

        @Size(max = 100, message = "Designation must be 100 characters or fewer")
        String designation,

        @Size(max = 300, message = "Profile URL must be 300 characters or fewer")
        @Pattern(regexp = "^$|^(https?://.+)$", message = "URL must start with http:// or https://")
        String profileUrl,

        @Pattern(
            regexp = "^[a-z0-9_-]{3,30}$",
            message = "Username must be 3-30 characters (lowercase letters, numbers, underscores, or hyphens)"
        )
        String userName,

        @Size(max = 60, message = "Profile name must be 60 characters or fewer")
        String profileName,



        Integer bannerId,

        @Size(max = 20, message = "Maximum 20 social links allowed")
        List<@Size(max = 200, message = "Social link too long") String> socials,

        @Size(max = 10, message = "Maximum 10 projects allowed")
        List<@Valid Project> projects,

        @Size(max = 5000, message = "Display preferences JSON is too large")
        String displayPreferences,

        @Size(max = 254, message = "Pin must be 254 characters or fewer")
        String pin

) {
}
