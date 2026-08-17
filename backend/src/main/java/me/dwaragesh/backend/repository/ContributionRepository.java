package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Contribution;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.enums.Platform;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {

    /**
     * Paginated fetch of most recent contributions across all platforms.
     * Used by the paginated API endpoint — default page size 30.
     */
    Page<Contribution> findByProfileOrderByDateDesc(Profile profile, Pageable pageable);

    /**
     * Full date-range fetch for heatmap rendering (e.g. last 365 days).
     * Returns per-platform rows; aggregation is done in the service layer.
     */
    @Query("""
        SELECT c FROM Contribution c
        WHERE c.profile = :profile
          AND c.date >= :from
          AND c.date <= :to
        ORDER BY c.date ASC
    """)
    List<Contribution> findByProfileAndDateRange(
            @Param("profile") Profile profile,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /**
     * Bulk delete by profile and platform — used during sync upsert
     * to wipe stale data before re-inserting fresh data from the API.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Contribution c WHERE c.profile = :profile AND c.platform = :platform")
    void deleteByProfileAndPlatform(
            @Param("profile") Profile profile,
            @Param("platform") Platform platform
    );

    /**
     * Check if a profile has any contributions at all — used during migration.
     */
    boolean existsByProfile(Profile profile);

    /**
     * Check if a specific contribution already exists — used during migration to avoid exceptions.
     */
    boolean existsByProfileAndPlatformAndDate(Profile profile, Platform platform, LocalDate date);

    /**
     * Delete all contributions for a profile — used during account deletion.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM Contribution c WHERE c.profile = :profile")
    void deleteAllByProfile(@Param("profile") Profile profile);
}
