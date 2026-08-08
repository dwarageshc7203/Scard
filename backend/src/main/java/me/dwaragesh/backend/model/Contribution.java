package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long contributionId;

    @ManyToOne
    private Profile profile;

    private String platform;
    private LocalDate contributionDate;
    private int count;

}
