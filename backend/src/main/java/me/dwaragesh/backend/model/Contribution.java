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
public class Contribution {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long contributionId;

    @ManyToOne
    private Profile profile;

    private Platform platform;
    private LocalDate contributionDate;
    private int count;

}
