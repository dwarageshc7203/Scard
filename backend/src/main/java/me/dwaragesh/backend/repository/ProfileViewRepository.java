package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.ProfileView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileViewRepository extends JpaRepository<ProfileView, Integer> {
    List<ProfileView> findByProfileOrderByViewedAtDesc(Profile profile);
}
