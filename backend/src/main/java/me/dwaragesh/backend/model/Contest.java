package me.dwaragesh.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int contestId;

    @ManyToOne
    private Profile profile;

    private String platform;
    private String contestName;
    private LocalDate contestDate;
    private long contestRating;

}
