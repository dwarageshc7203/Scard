package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {

    Optional<Profile> findFirstByUserName(String userName);

    @Query("SELECT p FROM Profile p WHERE p.lastSyncedAt IS NULL OR p.lastSyncedAt < :cutoff")
    List<Profile> findStale(@Param("cutoff") java.time.Instant cutoff, org.springframework.data.domain.Pageable page);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Profile p SET p.anonymousViews = p.anonymousViews + 1 WHERE p.profileId = :id")
    void incrementAnonymousViews(@Param("id") int id);

    Boolean existsByUserNameIgnoreCase(String username);

    Profile findByUser(User user);

    long countByHeatmapJsonNot(String value);

    @Query(value = "SELECT p.user_name FROM profile p WHERE EXISTS (" +
                   "  SELECT 1 FROM unnest(p.socials) AS s" +
                   "  WHERE s ILIKE 'LINKED_IN:' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKED_IN:%/' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKED_IN:%/' || :username || '/%' ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKED_IN:%/' || :username || '?%' ESCAPE '\\'" +
                   "     OR s ILIKE 'LINKEDIN:' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKEDIN:%/' || :username ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKEDIN:%/' || :username || '/%' ESCAPE '\\'" +
                   "     OR s ILIKE '%LINKEDIN:%/' || :username || '?%' ESCAPE '\\'" +
                   ")", nativeQuery = true)
    List<String> findUserNameByLinkedin(@Param("username") String username);

    @Query(value = "SELECT p.user_name FROM profile p JOIN app_user u ON p.user_id = u.user_id " +
                   "WHERE LOWER(u.email) = LOWER(:email) " +
                   "OR EXISTS (SELECT 1 FROM unnest(p.socials) AS s WHERE LOWER(s) = LOWER('MAIL:' || :email))",
           nativeQuery = true)
    List<String> findUserNameByMail(@Param("email") String email);

    @Query(value = "SELECT p.user_name FROM profile p " +
                   "WHERE LOWER('GITHUB:' || :username) = ANY(SELECT LOWER(x) FROM unnest(p.socials) AS x)",
           nativeQuery = true)
    List<String> findUserNameByGithub(@Param("username") String username);

    @Query(value = "SELECT p.user_name FROM profile p " +
                   "WHERE LOWER('LEETCODE:' || :username) = ANY(SELECT LOWER(x) FROM unnest(p.socials) AS x)",
           nativeQuery = true)
    List<String> findUserNameByLeetcode(@Param("username") String username);

    /**
     * public explore/directory page instead of loading the full entity graph.
     * Uses a CASE expression to prefer custom avatar over OAuth avatar.
     */
    @Query(value = "SELECT p.user_name, " +
                   "COALESCE(NULLIF(p.profile_name, ''), p.user_name) AS profile_name, " +
                   "p.designation, " +
                   "COALESCE(NULLIF(p.custom_image_url, ''), u.imageurl) AS image_url, " +
                   "p.pin, " +
                   "u.created_date_time AS created_at " +
                   "FROM profile p LEFT JOIN app_user u ON p.user_id = u.user_id",
           countQuery = "SELECT count(*) FROM profile p",
           nativeQuery = true)
    org.springframework.data.domain.Page<me.dwaragesh.backend.model.dto.ProfileSummaryProjection> findAllSummariesNative(org.springframework.data.domain.Pageable pageable);

    default org.springframework.data.domain.Page<me.dwaragesh.backend.model.dto.ProfileSummary> findAllSummaries(org.springframework.data.domain.Pageable pageable) {
        return findAllSummariesNative(pageable)
                .map(r -> new me.dwaragesh.backend.model.dto.ProfileSummary(
                        r.getUser_name(),
                        r.getProfile_name(),
                        r.getDesignation(),
                        r.getImage_url(),
                        r.getPin(),
                        r.getCreated_at()));
    }
}
