package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String profileUrl;
    private String customImageUrl;

    @Column(columnDefinition = "TEXT")
    private String asciiArt;

    private Integer bannerId;

    private List<String> socials;

    @Column(columnDefinition = "TEXT")
    private String heatmapJson;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Badge> badges;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Contest> contest;

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

    /**
     * @deprecated Use problemStats instead. Retained for backwards compatibility with existing databases.
     */
    @Deprecated
    @ElementCollection
    @CollectionTable(name = "profile_problemjs_solved", joinColumns = @JoinColumn(name = "profile_id"))
    @MapKeyColumn(name = "platform")
    @Column(name = "count")
    private Map<String, Integer> problemsSolved;

    @ElementCollection
    @CollectionTable(name = "profile_problem_stats", joinColumns = @JoinColumn(name = "profile_id"))
    @MapKeyColumn(name = "platform")
    private Map<String, ProblemStats> problemStats;

}
