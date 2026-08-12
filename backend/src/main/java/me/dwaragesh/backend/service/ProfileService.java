package me.dwaragesh.backend.service;

import me.dwaragesh.backend.exception.ProfileNotFoundException;
import me.dwaragesh.backend.exception.UsernameTakenException;
import me.dwaragesh.backend.model.*;
import me.dwaragesh.backend.model.dto.OnBoardingRequest;
import me.dwaragesh.backend.model.dto.PatchProfileRequest;
import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
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
                profile.getContributions());
    }

    public ProfileResponse createProfile(User user, OnBoardingRequest request) {

        if (repository.existsByUserName(request.userName())) {
            throw new UsernameTakenException("Username already taken: " + request.userName());
        }

        Profile profile = new Profile();
        profile.setUser(user);
        profile.setDesignation(request.designation());
        profile.setUserName(request.userName());

        Profile saved = repository.save(profile);

        return toResponse(saved);
    }

    public ProfileResponse getProfile(String userName) {
        Profile profile = repository.findFirstByUserName(userName)
                .orElseThrow(() -> new ProfileNotFoundException("Profile does not exist"));
        return toResponse(profile);
    }

    public List<ProfileResponse> getAllProfiles() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProfileResponse patchProfile(User user, PatchProfileRequest request) {
        Profile profile = user.getProfile();
        if (profile == null) {
            throw new ProfileNotFoundException("Profile does not exist");
        }

        if(request.designation() != null) {
            profile.setDesignation(request.designation());
        }
        if(request.profileURL() != null) {
            profile.setProfileUrl(request.profileURL());
        }
        if(request.badges() != null) {
            profile.setBadges(request.badges());
        }
        if(request.contributions() != null) {
            profile.setContributions(request.contributions());
        }
        if(request.contests() != null) {
            profile.setContest(request.contests());
        }

        Profile saved = repository.save(profile);

        return toResponse(saved);
    }
}
