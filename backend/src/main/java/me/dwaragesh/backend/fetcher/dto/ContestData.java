package me.dwaragesh.backend.fetcher.dto;

import java.time.LocalDate;

public record ContestData(

        String contestName,
        LocalDate contestDate,
        long contestRating

) {
}
