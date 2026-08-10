package me.dwaragesh.backend.model.dto;

import java.util.UUID;

public record MeResponse(

        UUID userId,
        String email,
        String userName,
        String imageURL,
        boolean hasProfile

) {
}
