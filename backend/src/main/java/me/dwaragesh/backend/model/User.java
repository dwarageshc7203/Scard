package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_user")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID userId;

    @Column(unique = true)
    private String googleId;
    private String email;
    private String imageURL;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;

    @CreationTimestamp
    private Instant createdDateTime;

    @UpdateTimestamp
    private Instant lastUpdatedDateTime;

}
