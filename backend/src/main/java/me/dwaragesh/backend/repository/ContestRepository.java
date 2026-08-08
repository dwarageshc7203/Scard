package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Contest;
import me.dwaragesh.backend.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ContestRepository extends JpaRepository<Contest, Integer> {
    List<Contest> findByProfileProfileId(UUID profileId);
}
