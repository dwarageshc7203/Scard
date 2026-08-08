package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Optional<Profile> findByUserName(String userName);
    Boolean existsByUserName(String username);
}
