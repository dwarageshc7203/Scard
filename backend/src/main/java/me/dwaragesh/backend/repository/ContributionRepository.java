package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Contribution;
import me.dwaragesh.backend.model.enums.Platform;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByProfileProfileIdAndPlatform(int profileId, Platform platform);
    Optional<Contribution> findByProfileProfileIdAndPlatformAndContributionDate(int profileId, Platform platform, LocalDate date);
}
