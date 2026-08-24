package me.dwaragesh.backend.service;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.MeResponse;
import me.dwaragesh.backend.repository.ProfileViewRepository;
import me.dwaragesh.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

/**
 * User lifecycle service.
 *
 * <p>HIGH-5: Removed {@code synchronized} from {@code findOrCreateFromGoogle}.
 * The method was previously serialising every authenticated request behind a
 * single JVM lock — catastrophic for throughput and incompatible with
 * multi-pod deployments.
 *
 * <p>Race safety is handled by the unique DB constraint on {@code google_id}:
 * if two threads race to INSERT the same Google user, one will get a
 * {@link DataIntegrityViolationException}, which we catch and retry as a
 * SELECT — the same pattern already used in {@code ProfileService.createProfile()}.
 *
 * <p>LOW-6: Converted to constructor injection; fields are {@code final}.
 */
@Slf4j
@Service
public class UserService {

    private final UserRepository repository;
    private final ProfileViewRepository profileViewRepository;

    public UserService(UserRepository repository,
                       ProfileViewRepository profileViewRepository) {
        this.repository = repository;
        this.profileViewRepository = profileViewRepository;
    }

    /**
     * Finds an existing user by Google ID, or creates one transactionally.
     * <p>No {@code synchronized} — the DB unique constraint on {@code google_id}
     * handles concurrent inserts via the catch-and-retry pattern.
     */
    public User findOrCreateFromGoogle(org.springframework.security.oauth2.core.oidc.user.OidcUser principal) {
        Boolean verified = principal.getEmailVerified();
        if (verified != null && !verified) {
            throw new org.springframework.security.access.AccessDeniedException("Google email must be verified");
        }
        return findOrCreateFromGoogle(principal.getSubject(), principal.getEmail(), principal.getPicture());
    }

    @Transactional
    public User findOrCreateFromGoogle(String googleId, String email, String imageURL) {
        return repository.findByGoogleId(googleId)
                .orElseGet(() -> createOrLinkUser(googleId, email, imageURL));
    }

    private User createOrLinkUser(String googleId, String email, String imageURL) {
        // If a legacy account exists for this email without a Google ID, link them.
        if (email != null) {
            java.util.Optional<User> existing = repository.findByEmail(email);
            if (existing.isPresent()) {
                User user = existing.get();
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    if (user.getImageURL() == null) {
                        user.setImageURL(imageURL);
                    }
                    return repository.save(user);
                }
                return user;
            }
        }
        try {
            User user = new User();
            user.setGoogleId(googleId);
            user.setEmail(email);
            user.setImageURL(imageURL);
            return repository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Another thread won the race — just fetch the row they inserted.
            log.debug("Race on google_id={}, fetching existing user", googleId);
            return repository.findByGoogleId(googleId)
                    .orElseThrow(() -> new IllegalStateException(
                            "User not found after DataIntegrityViolationException", e));
        }
    }

    public MeResponse toMeResponse(User user) {
        boolean hasProfile = user.getProfile() != null;
        return new MeResponse(
                user.getUserId(),
                hasProfile ? user.getProfile().getUserName() : null,
                user.getImageURL(),
                hasProfile
        );
    }

    @Transactional
    public void deleteUser(User user) {
        User managedUser = repository.findById(user.getUserId()).orElse(null);
        if (managedUser == null) return;

        profileViewRepository.deleteByViewer(managedUser);

        if (managedUser.getProfile() != null && managedUser.getProfile().getViews() != null) {
            managedUser.getProfile().getViews().removeIf(v ->
                v.getViewer() != null && v.getViewer().getUserId().equals(managedUser.getUserId()));
        }

        repository.delete(managedUser);
    }
}
