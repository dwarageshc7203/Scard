package me.dwaragesh.backend.service;

import me.dwaragesh.backend.exception.ProfileNotFoundException;
import me.dwaragesh.backend.exception.UsernameTakenException;
import me.dwaragesh.backend.model.*;
import me.dwaragesh.backend.model.dto.OnBoardingRequest;
import me.dwaragesh.backend.model.dto.PatchProfileRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.repository.ProfileRepository;
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

    public ProfileResponse toResponse(Profile profile) {
        return new ProfileResponse(
                profile.getUserName(),
                profile.getDesignation(),
                profile.getProfileUrl(),
                profile.getAsciiArt(),
                profile.getBadges(),
                profile.getContest(),
                profile.getHeatmapJson() != null ? profile.getHeatmapJson() : "[]");
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

    @Transactional(readOnly = true)
    public List<ProfileResponse> getAllProfiles() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProfileResponse patchProfile(User user, PatchProfileRequest request) {
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new ProfileNotFoundException("Profile does not exist");
        }

        if (request.designation() != null) {
            profile.setDesignation(request.designation());
        }
        if (request.profileURL() != null) {
            profile.setProfileUrl(request.profileURL());
        }
        if (request.badges() != null) {
            profile.setBadges(request.badges());
        }

        if (request.contests() != null) {
            profile.setContest(request.contests());
        }

        Profile saved = repository.save(profile);

        return toResponse(saved);
    }
}
