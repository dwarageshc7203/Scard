package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int badgeId;

    @ManyToOne
    private Profile profile;

    private String platform;
    private String badgeName;
    private String badgeURL;
    private LocalDate badgeDate;

}
