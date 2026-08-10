package me.dwaragesh.backend.model.dto;

import me.dwaragesh.backend.model.enums.Platform;

public record LinkPlatformRequest(Platform platform, String externalUsername) {}