package me.dwaragesh.backend.service;

import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.model.dto.MeResponse;
import me.dwaragesh.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public synchronized User findOrCreateFromGoogle(String googleId, String email, String imageURL) {
        return repository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    return repository.findAll().stream()
                            .filter(u -> email != null && email.equals(u.getEmail()))
                            .findFirst()
                            .orElseGet(() -> {
                                User user = new User();
                                user.setGoogleId(googleId);
                                user.setEmail(email);
                                user.setImageURL(imageURL);
                                return repository.save(user);
                            });
                });
    }

    public MeResponse toMeResponse(User user) {
        boolean hasProfile = user.getProfile() != null;
        return new MeResponse(
                user.getUserId(),
                user.getEmail(),
                hasProfile ? user.getProfile().getUserName(): null,
                user.getImageURL(),
                hasProfile
        );
    }

    @Autowired
    private me.dwaragesh.backend.repository.ProfileViewRepository profileViewRepository;

    @Transactional
    public void deleteUser(User user) {
        profileViewRepository.deleteByViewer(user);
        repository.delete(user);
    }

}
