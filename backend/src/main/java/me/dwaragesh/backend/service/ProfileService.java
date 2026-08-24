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

    private final ProfileRepository repository;
    private final UserRepository userRepository;
    private final ProfileViewRepository profileViewRepository;
    private final ContributionRepository contributionRepository;

    public ProfileService(ProfileRepository repository, UserRepository userRepository, 
                          ProfileViewRepository profileViewRepository, ContributionRepository contributionRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.profileViewRepository = profileViewRepository;
        this.contributionRepository = contributionRepository;
    }

    private final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public ProfileResponse toResponse(Profile profile) {
        String contribJson = profile.getHeatmapJson();
        if (contribJson == null || contribJson.trim().isEmpty() || contribJson.equals("[]")) {
            // Fallback to the loaded contributions relation to keep the mapper pure
            List<Contribution> recent = profile.getContributions();
            if (recent == null) recent = java.util.Collections.emptyList();
            
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
                (profile.getProfileName() != null && !profile.getProfileName().trim().isEmpty()) ? profile.getProfileName() : profile.getUserName(),
                profile.getDesignation(),
                profile.getPin(),
                profile.getProfileUrl(),
                (profile.getCustomImageUrl() != null && !profile.getCustomImageUrl().trim().isEmpty()) ? profile.getCustomImageUrl() : (profile.getUser() != null ? profile.getUser().getImageURL() : null),
                profile.getBannerId(),
                profile.getSocials(),
                profile.getBadges(),
                profile.getContests(),
                profile.getProblemStats(),
                profile.getProjects(),
                profile.getAnonymousViews(),
                profile.getUser() != null ? profile.getUser().getCreatedDateTime() : null,
                contribJson,
                profile.getDisplayPreferences() != null && !profile.getDisplayPreferences().isEmpty() ? profile.getDisplayPreferences() : "{}");
    }

    @Transactional
    public ProfileResponse createProfile(User user, OnBoardingRequest request) {
        // Idempotent: if this user already has a profile, return it
        Profile existing = repository.findByUser(user);
        if (existing != null) {
            return toResponse(existing);
        }

        if (repository.existsByUserNameIgnoreCase(request.userName())) {
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

    /**
     * CRIT-2: Public (unauthenticated) version of getProfile.
     * Strips MAIL: socials so email addresses are never returned to anonymous callers.
     */
    @Transactional(readOnly = true)
    public ProfileResponse getPublicProfile(String userName) {
        Profile profile = repository.findFirstByUserName(userName)
                .orElseThrow(() -> new ProfileNotFoundException("Profile does not exist"));
        return toPublicResponse(profile);
    }

    /**
     * CRIT-2: Strips any social entry whose prefix is MAIL: before returning to anonymous callers.
     * Authenticated profile owners still receive the full list via toResponse().
     */
    private ProfileResponse toPublicResponse(Profile profile) {
        ProfileResponse full = toResponse(profile);
        if (full.socials() == null) return full;
        List<String> filtered = full.socials().stream()
                .filter(s -> !s.toUpperCase().startsWith("MAIL:"))
                .collect(Collectors.toList());
        return new ProfileResponse(
                full.userName(), full.profileName(), full.designation(), full.pin(),
                full.profileUrl(), full.imageURL(), full.bannerId(), filtered,
                full.badges(), full.contests(), full.problemStats(), full.projects(),
                full.anonymousViews(), full.createdAt(), full.contributions(),
                full.displayPreferences());
    }

    @Transactional
    public ProfileResponse getProfileAndTrackView(String userName, String viewerGoogleId) {
        return getProfileAndTrackViewInternal(userName, viewerGoogleId, false);
    }

    /** CRIT-2: Public variant — strips MAIL: socials from the response. */
    @Transactional
    public ProfileResponse getPublicProfileAndTrackView(String userName, String viewerGoogleId) {
        return getProfileAndTrackViewInternal(userName, viewerGoogleId, true);
    }

    @Transactional
    private ProfileResponse getProfileAndTrackViewInternal(String userName, String viewerGoogleId, boolean publicView) {
        Profile profile = repository.findFirstByUserName(userName)
                .orElseThrow(() -> new ProfileNotFoundException("Profile does not exist"));
        
        if (viewerGoogleId == null) {
            profile.setAnonymousViews(profile.getAnonymousViews() + 1);
            repository.save(profile);
        } else {
            User viewer = userRepository.findByGoogleId(viewerGoogleId).orElse(null);
            if (viewer != null && profile.getUser() != null && !viewer.getUserId().equals(profile.getUser().getUserId())) {
                java.util.Optional<ProfileView> lastView = profileViewRepository.findFirstByProfileAndViewerOrderByViewedAtDesc(profile, viewer);
                if (lastView.isEmpty() || java.time.Duration.between(lastView.get().getViewedAt(), java.time.Instant.now()).toHours() > 24) {
                    ProfileView view = new ProfileView();
                    view.setProfile(profile);
                    view.setViewer(viewer);
                    profileViewRepository.save(view);
                }
            }
        }
        
        return publicView ? toPublicResponse(profile) : toResponse(profile);
    }

    /**
     * HIGH-4: Use a targeted query that fetches only summary columns instead of
     * loading the entire entity graph (socials, badges, contests, contributions) for
     * every user into memory on every page load.
     */
    @Transactional(readOnly = true)
    public List<me.dwaragesh.backend.model.dto.ProfileSummary> getAllProfiles() {
        return repository.findAllSummaries();
    }

    @Transactional(readOnly = true)
    public boolean isUsernameTaken(String username) {
        return repository.existsByUserNameIgnoreCase(username);
    }

    private String extractUsernameFromUrl(String url) {
        if (url == null) return null;
        String trimmed = url.trim();
        if (trimmed.contains("/")) {
            String[] parts = trimmed.split("/");
            String last = parts[parts.length - 1];
            if (last.isEmpty() && parts.length > 1) {
                return parts[parts.length - 2];
            }
            return last;
        }
        return trimmed;
    }

    private String escapeLikePattern(String str) {
        if (str == null) return null;
        return str.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    @Transactional(readOnly = true)
    public String checkLinkedinOwner(String username) {
        java.util.List<String> owners = repository.findUserNameByLinkedin(escapeLikePattern(extractUsernameFromUrl(username)));
        if (owners.isEmpty()) {
            owners = repository.findUserNameByLinkedin(escapeLikePattern(username));
        }
        return owners.isEmpty() ? null : owners.get(0);
    }

    @Transactional(readOnly = true)
    public String checkGithubOwner(String username) {
        java.util.List<String> owners = repository.findUserNameByGithub(extractUsernameFromUrl(username));
        if (owners.isEmpty()) {
            owners = repository.findUserNameByGithub(username);
        }
        return owners.isEmpty() ? null : owners.get(0);
    }

    @Transactional(readOnly = true)
    public String checkLeetcodeOwner(String username) {
        java.util.List<String> owners = repository.findUserNameByLeetcode(extractUsernameFromUrl(username));
        if (owners.isEmpty()) {
            owners = repository.findUserNameByLeetcode(username);
        }
        return owners.isEmpty() ? null : owners.get(0);
    }

    @Transactional(readOnly = true)
    public String checkMailOwner(String email) {
        java.util.List<String> owners = repository.findUserNameByMail(email);
        return owners.isEmpty() ? null : owners.get(0);
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
        if (request.userName() != null && !request.userName().isEmpty()) {
            if (!request.userName().equals(profile.getUserName())) {
                if (repository.existsByUserNameIgnoreCase(request.userName())) {
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
            profile.setSocials(new java.util.ArrayList<>(request.socials()));
        }
        if (request.projects() != null) {
            java.util.List<Project> newProjects = new java.util.ArrayList<>();
            for (Project p : request.projects()) {
                // HIGH-3: Enforce a per-project base64 size limit to prevent 100MB PATCH bombs.
                // 540000 chars ≈ 400KB decoded — enough for a thumbnail.
                if (p.getProjectImageBase64() != null && p.getProjectImageBase64().length() > 540_000) {
                    throw new IllegalArgumentException(
                        "Project image too large. Please use a URL instead or keep images under 400KB.");
                }
                p.setProjectId(null);
                p.setProfile(profile);
                newProjects.add(p);
            }
            if (profile.getProjects() != null) {
                profile.getProjects().clear();
                profile.getProjects().addAll(newProjects);
            } else {
                profile.setProjects(newProjects);
            }
        }
        

        if (request.bannerId() != null) {
            if (request.bannerId() == 0) {
                profile.setBannerId(null);
            } else {
                profile.setBannerId(request.bannerId());
            }
        }
        if (request.displayPreferences() != null) {
            // HIGH-2: Reject raw strings that aren't valid JSON to prevent stored XSS
            // and ensure the frontend can always safely parse this field.
            try {
                new com.fasterxml.jackson.databind.ObjectMapper().readTree(request.displayPreferences());
            } catch (Exception e) {
                throw new IllegalArgumentException("displayPreferences must be valid JSON");
            }
            profile.setDisplayPreferences(request.displayPreferences());
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
