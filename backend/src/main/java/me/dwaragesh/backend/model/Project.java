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

    @jakarta.validation.constraints.Size(max = 100, message = "Project name must be 100 characters or fewer")
    private String name;

    @jakarta.validation.constraints.Size(max = 2000, message = "Project description must be 2000 characters or fewer")
    @Column(columnDefinition = "TEXT")
    private String description;

    @jakarta.validation.constraints.Size(max = 2000000, message = "Image is too large (max 2MB base64)")
    @Column(columnDefinition = "TEXT")
    private String projectImageBase64;

    @jakarta.validation.constraints.Size(max = 500, message = "Project URL is too long")
    private String projectUrl;

    @jakarta.validation.constraints.Size(max = 500, message = "Repo URL is too long")
    private String repoUrl;
}
