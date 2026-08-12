package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.dwaragesh.backend.model.enums.Platform;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int badgeId;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Profile profile;

    @Enumerated(EnumType.STRING)
    private Platform platform;
    private String badgeName;
    private String badgeURL;
    private LocalDate badgeDate;

}
