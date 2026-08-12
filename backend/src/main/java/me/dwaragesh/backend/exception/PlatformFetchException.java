package me.dwaragesh.backend.exception;

public class PlatformFetchException extends RuntimeException {
    public PlatformFetchException(String message) {
        super(message);
    }
    public PlatformFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}
