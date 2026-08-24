package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer projectId;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Profile profile;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String projectImageBase64;
    @jakarta.validation.constraints.Pattern(regexp = "^(https?://.+)$", message = "URL must start with http:// or https://")
    private String projectUrl;
    @jakarta.validation.constraints.Pattern(regexp = "^(https?://.+)$", message = "URL must start with http:// or https://")
    private String repoUrl;
}
