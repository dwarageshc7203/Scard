package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.enums.Platform;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LinkPlatformRequest(
    @NotNull(message = "Platform is required") Platform platform,
    @Size(max = 100, message = "External username must be 100 characters or fewer") String externalUsername
) {}