package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Contribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ContributionRepository extends JpaRepository<Contribution, Long> {
    List<Contribution> findByProfileProfileIdAndPlatform(UUID profileId, String platform);
    Optional<Contribution> findByProfileProfileIdAndPlatformAndContributionDate(UUID profileId, String platform, LocalDate date);
}
