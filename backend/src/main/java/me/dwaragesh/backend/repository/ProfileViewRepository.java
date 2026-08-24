package me.dwaragesh.backend.repository;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.ProfileView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileViewRepository extends JpaRepository<ProfileView, Integer> {
    List<ProfileView> findByProfileOrderByViewedAtDesc(Profile profile);
    org.springframework.data.domain.Page<ProfileView> findByProfileOrderByViewedAtDesc(Profile profile, org.springframework.data.domain.Pageable pageable);
    java.util.Optional<ProfileView> findFirstByProfileAndViewerOrderByViewedAtDesc(Profile profile, me.dwaragesh.backend.model.User viewer);
    void deleteByViewer(me.dwaragesh.backend.model.User viewer);
}
