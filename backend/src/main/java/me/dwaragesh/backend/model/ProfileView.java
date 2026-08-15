package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileView {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int viewId;

    @ManyToOne
    @JoinColumn(name = "profile_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Profile profile;

    @ManyToOne
    @JoinColumn(name = "viewer_id")
    private User viewer;

    @CreationTimestamp
    private Instant viewedAt;
}
