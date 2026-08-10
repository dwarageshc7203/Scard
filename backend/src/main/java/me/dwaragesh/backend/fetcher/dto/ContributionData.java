package me.dwaragesh.backend.fetcher.dto;

import java.time.LocalDate;

public record ContributionData(

        LocalDate date,
        int count

) {
}
