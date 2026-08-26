package me.dwaragesh.backend.model.dto;

public record ProfileSummary(
        String userName,
        String profileName,
        String designation,
        String imageURL,
        String pin,
        java.time.Instant createdAt
) {
}
