package me.dwaragesh.backend.model.dto;

/**
 * HIGH-4: Spring Data JPA native query projection for the lightweight profile
 * summary used on the public explore/directory page.
 *
 * <p>Column names must match the SQL aliases in {@code ProfileRepository.findAllSummariesNative()}.
 */
public interface ProfileSummaryProjection {
    String getUser_name();
    String getProfile_name();
    String getDesignation();
    String getImage_url();
}
