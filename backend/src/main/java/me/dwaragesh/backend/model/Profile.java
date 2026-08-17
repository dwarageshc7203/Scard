package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int profileId;

    @OneToOne
    @JoinColumn(name = "userId", unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;
    
    @Column(unique = true, nullable = false)
    private String userName;
    
    private String profileName;

    private String designation;
    private String pin;
    private String profileUrl;
    private String customImageUrl;

    @Column(columnDefinition = "TEXT")
    private String asciiArt;

    /**
     * The banner selected for this profile card.
     * Stored as a FK to the Banner table for referential integrity.
     * Use getBannerId() to get the raw int for API responses.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banner_id")
    private Banner banner;

    /** Convenience accessor for the banner ID, used in ProfileResponse DTO. */
    public Integer getBannerId() {
        return banner != null ? banner.getId() : null;
    }

    /** Convenience setter that constructs a Banner reference from an ID. Used in ProfileService. */
    public void setBannerId(Integer bannerId) {
        if (bannerId == null) {
            this.banner = null;
        } else {
            Banner b = new Banner();
            b.setId(bannerId);
            this.banner = b;
        }
    }

    private List<String> socials;

    @Column(columnDefinition = "TEXT")
    private String heatmapJson;

    /** Tracks when platforms were last synced to avoid hammering external APIs on every login. */
    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    /** Set to true once the user completes the onboarding questionnaire. */
    @Column(name = "onboarding_completed")
    private boolean onboardingCompleted = false;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Badge> badges;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Contest> contests;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfileView> views;

    @Column(name = "anonymous_views")
    private Integer anonymousViews = 0;

    public Integer getAnonymousViews() {
        return anonymousViews != null ? anonymousViews : 0;
    }

    public void setAnonymousViews(Integer anonymousViews) {
        this.anonymousViews = anonymousViews;
    }


    @ElementCollection
    @CollectionTable(name = "profile_problem_stats", joinColumns = @JoinColumn(name = "profile_id"))
    @MapKeyColumn(name = "platform")
    private Map<String, ProblemStats> problemStats;

}
