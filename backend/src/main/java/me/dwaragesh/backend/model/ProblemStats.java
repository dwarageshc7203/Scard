package me.dwaragesh.backend.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProblemStats {
    private int total;
    private int easy;
    private int medium;
    private int hard;
}
