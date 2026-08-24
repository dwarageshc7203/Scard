package me.dwaragesh.backend.util;

public class ValidationUtils {
    public static void validateExternalUsername(String externalUsername) {
        if (externalUsername == null || externalUsername.isBlank()) {
            throw new IllegalArgumentException("External username is required");
        }
        if (externalUsername.length() > 50) {
            throw new IllegalArgumentException("External username must be 50 characters or fewer");
        }
        if (!externalUsername.matches("^[a-zA-Z0-9._-]+$")) {
            throw new IllegalArgumentException("External username contains invalid characters");
        }
    }
}
