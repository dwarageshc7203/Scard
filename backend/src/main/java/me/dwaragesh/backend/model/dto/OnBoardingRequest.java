package me.dwaragesh.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OnBoardingRequest(

        @NotBlank(message = "Username is required")
        @Pattern(
            regexp = "^[a-z]{3,30}$",
            message = "Username must be 3-30 lowercase letters only"
        )
        String userName,

        @Size(max = 60, message = "Profile name must be 60 characters or fewer")
        String profileName,

        @Size(max = 100, message = "Designation must be 100 characters or fewer")
        String designation

) {
}
