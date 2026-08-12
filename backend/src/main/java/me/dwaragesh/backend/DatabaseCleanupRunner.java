package me.dwaragesh.backend;

import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.repository.UserRepository;
import me.dwaragesh.backend.repository.BadgeRepository;
import me.dwaragesh.backend.repository.ContestRepository;
import me.dwaragesh.backend.repository.ContributionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DatabaseCleanupRunner implements CommandLineRunner {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final ContestRepository contestRepository;
    private final ContributionRepository contributionRepository;

    public DatabaseCleanupRunner(
            ProfileRepository profileRepository,
            UserRepository userRepository,
            BadgeRepository badgeRepository,
            ContestRepository contestRepository,
            ContributionRepository contributionRepository
    ) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.badgeRepository = badgeRepository;
        this.contestRepository = contestRepository;
        this.contributionRepository = contributionRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("--- STARTING DATABASE CLEANUP FOR A CLEAN SLATE ---");
        badgeRepository.deleteAll();
        contestRepository.deleteAll();
        contributionRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();
        System.out.println("--- DATABASE CLEANUP COMPLETE ---");
    }
}
