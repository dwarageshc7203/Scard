package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.dwaragesh.backend.model.enums.Platform;

import java.time.LocalDate;

/**
 * Stores individual daily contribution counts per platform per profile.
 * Replaces the heatmapJson TEXT blob with a properly indexed, queryable table.
 *
 * The unique constraint on (profile_id, platform, contrib_date) ensures
 * sync operations are idempotent — re-syncing cannot create duplicate rows.
 */
@Entity
@Table(
    name = "contribution",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_contribution_profile_platform_date",
        columnNames = {"profile_id", "platform", "contrib_date"}
    ),
    indexes = {
        // Fast lookup: all contributions for a profile ordered by date descending
        @Index(name = "idx_contribution_profile_date", columnList = "profile_id, contrib_date DESC")
    }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Profile profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Platform platform;

    @Column(name = "contrib_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private int count;
}
