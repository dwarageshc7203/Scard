package me.dwaragesh.backend.fetcher.dto;

import java.time.LocalDate;

public record BadgeData(

        String badgeName,
        String badgeURL,
        LocalDate badgeDate

) {
}
