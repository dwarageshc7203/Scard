package me.dwaragesh.backend.service;

import me.dwaragesh.backend.exception.ProfileNotFoundException;
import me.dwaragesh.backend.exception.UsernameTakenException;
import me.dwaragesh.backend.model.*;
import me.dwaragesh.backend.model.dto.OnBoardingRequest;
import me.dwaragesh.backend.model.dto.PatchProfileRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.repository.ProfileViewRepository;
import me.dwaragesh.backend.repository.UserRepository;
import me.dwaragesh.backend.repository.ContributionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private ProfileRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileViewRepository profileViewRepository;

    @Autowired
    private ContributionRepository contributionRepository;

    @Autowired
    private com.fasterxml.jackson.databind.ObjectMapper mapper;

    public ProfileResponse toResponse(Profile profile) {
        String contribJson = profile.getHeatmapJson();
        if (contribJson == null || contribJson.trim().isEmpty() || contribJson.equals("[]")) {
            // Fallback to the new normalized table if migration happened or for new users
            java.time.LocalDate oneYearAgo = java.time.LocalDate.now().minusDays(365);
            List<Contribution> recent = contributionRepository.findByProfileAndDateRange(profile, oneYearAgo, java.time.LocalDate.now());
            
            // Map back to the legacy JSON structure expected by the frontend
            List<java.util.Map<String, Object>> mapped = recent.stream().map(c -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("platform", c.getPlatform().name());
                map.put("contributionDate", c.getDate().toString());
                map.put("count", c.getCount());
                return map;
            }).collect(Collectors.toList());
            
            try {
                contribJson = mapper.writeValueAsString(mapped);
            } catch (Exception e) {
                contribJson = "[]";
            }
        }

        return new ProfileResponse(
                profile.getUserName(),
                profile.getProfileName() != null ? profile.getProfileName() : profile.getUserName(),
                profile.getDesignation(),
                profile.getPin(),
                profile.getProfileUrl(),
                (profile.getCustomImageUrl() != null && !profile.getCustomImageUrl().trim().isEmpty()) ? profile.getCustomImageUrl() : (profile.getUser() != null ? profile.getUser().getImageURL() : null),
                profile.getAsciiArt(),
                profile.getBannerId(),
                profile.getSocials(),
                profile.getBadges(),
                profile.getContests(),
                profile.getProblemStats(),
                profile.getProjects(),
                profile.getAnonymousViews(),
                profile.getUser() != null ? profile.getUser().getCreatedDateTime() : null,
                contribJson);
    }

    @Transactional
    public ProfileResponse createProfile(User user, OnBoardingRequest request) {
        // Idempotent: if this user already has a profile, return it
        Profile existing = repository.findByUser(user);
        if (existing != null) {
            return toResponse(existing);
        }

        if (repository.existsByUserName(request.userName())) {
            throw new UsernameTakenException("Username already taken: " + request.userName());
        }

        try {
            Profile profile = new Profile();
            profile.setUser(user);
            profile.setDesignation(request.designation());
            profile.setUserName(request.userName());
            profile.setProfileName(request.profileName() != null ? request.profileName() : request.userName());
            return toResponse(repository.save(profile));
        } catch (DataIntegrityViolationException e) {
            // Two concurrent requests raced; the other thread won — find and return theirs
            Profile race = repository.findByUser(user);
            if (race != null) return toResponse(race);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String userName) {
        Profile profile = repository.findFirstByUserName(userName)
                .orElseThrow(() -> new ProfileNotFoundException("Profile does not exist"));
        return toResponse(profile);
    }

    @Transactional
    public ProfileResponse getProfileAndTrackView(String userName, String viewerGoogleId) {
        Profile profile = repository.findFirstByUserName(userName)
                .orElseThrow(() -> new ProfileNotFoundException("Profile does not exist"));
        
        if (viewerGoogleId == null) {
            profile.setAnonymousViews(profile.getAnonymousViews() + 1);
            repository.save(profile);
        } else {
            User viewer = userRepository.findByGoogleId(viewerGoogleId).orElse(null);
            if (viewer != null && profile.getUser() != null && !viewer.getUserId().equals(profile.getUser().getUserId())) {
                List<ProfileView> recentViews = profileViewRepository.findByProfileOrderByViewedAtDesc(profile);
                if (recentViews.isEmpty() || !recentViews.get(0).getViewer().getUserId().equals(viewer.getUserId())) {
                    ProfileView view = new ProfileView();
                    view.setProfile(profile);
                    view.setViewer(viewer);
                    profileViewRepository.save(view);
                }
            }
        }
        
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public List<me.dwaragesh.backend.model.dto.ProfileSummary> getAllProfiles() {
        return repository.findAll().stream()
                .map(p -> new me.dwaragesh.backend.model.dto.ProfileSummary(
                        p.getUserName(),
                        p.getProfileName() != null ? p.getProfileName() : p.getUserName(),
                        p.getDesignation(),
                        (p.getCustomImageUrl() != null && !p.getCustomImageUrl().trim().isEmpty()) ? p.getCustomImageUrl() : (p.getUser() != null ? p.getUser().getImageURL() : null)
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isUsernameTaken(String username) {
        return repository.existsByUserName(username);
    }

    public Profile getRawProfile(String userName) {
        return repository.findFirstByUserName(userName).orElseThrow();
    }

    @Transactional
    public ProfileResponse patchProfile(User user, PatchProfileRequest request) {
        Profile profile = user.getProfile();
        if (profile == null) {
            profile = new Profile();
            profile.setUser(user);
            profile.setAnonymousViews(0);
        }

        if (request.designation() != null) {
            profile.setDesignation(request.designation());
        }
        if (request.profileUrl() != null) {
            profile.setProfileUrl(request.profileUrl());
        }
        if (request.asciiArt() != null) {
            profile.setAsciiArt(request.asciiArt());
        }
        if (request.userName() != null && !request.userName().isEmpty()) {
            if (!request.userName().equals(profile.getUserName())) {
                if (repository.existsByUserName(request.userName())) {
                    throw new UsernameTakenException("Username already taken: " + request.userName());
                }
                profile.setUserName(request.userName());
                user.setUserName(request.userName());
            }
        }
        if (request.profileName() != null) {
            profile.setProfileName(request.profileName());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        if (request.socials() != null) {
            if (profile.getSocials() == null) {
                profile.setSocials(new java.util.ArrayList<>());
            } else {
                profile.getSocials().clear();
            }
            profile.getSocials().addAll(request.socials());
        }
        if (request.projects() != null) {
            if (profile.getProjects() == null) {
                profile.setProjects(new java.util.ArrayList<>());
            } else {
                profile.getProjects().clear();
            }
            for (Project p : request.projects()) {
                p.setProjectId(null);
                p.setProfile(profile);
                profile.getProjects().add(p);
            }
        }
        

        if (request.bannerId() != null) {
            profile.setBannerId(request.bannerId());
        }

        Profile saved = repository.save(profile);
        userRepository.save(user);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public me.dwaragesh.backend.model.dto.AnalyticsResponse getAnalytics(User user) {
        Profile profile = user.getProfile();
        if (profile == null) throw new ProfileNotFoundException("Profile does not exist");
        
        List<ProfileView> views = profileViewRepository.findByProfileOrderByViewedAtDesc(profile);
        List<me.dwaragesh.backend.model.dto.AnalyticsResponse.ViewerDto> recentViewers = views.stream()
                .map(v -> new me.dwaragesh.backend.model.dto.AnalyticsResponse.ViewerDto(
                        v.getViewer().getUserName(),
                        (v.getViewer().getProfile() != null && v.getViewer().getProfile().getProfileName() != null) ? v.getViewer().getProfile().getProfileName() : v.getViewer().getUserName(), 
                        (v.getViewer().getProfile() != null && v.getViewer().getProfile().getCustomImageUrl() != null && !v.getViewer().getProfile().getCustomImageUrl().isEmpty()) ? v.getViewer().getProfile().getCustomImageUrl() : v.getViewer().getImageURL(),
                        v.getViewedAt()
                ))
                .collect(Collectors.toList());
                
        return new me.dwaragesh.backend.model.dto.AnalyticsResponse(profile.getAnonymousViews(), recentViewers);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<Contribution> getPaginatedContributions(String userName, org.springframework.data.domain.Pageable pageable) {
        Profile profile = repository.findFirstByUserName(userName)
                .orElseThrow(() -> new ProfileNotFoundException("Profile does not exist"));
        return contributionRepository.findByProfileOrderByDateDesc(profile, pageable);
    }
}
