package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BadgeRepository extends JpaRepository<Badge, Integer> {
    List<Badge> findByProfileProfileId(int profileId);
}
