package me.dwaragesh.backend;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.User;
import me.dwaragesh.backend.repository.ProfileRepository;
import me.dwaragesh.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import java.util.List;
import static org.assertj.core.api.Assertions.assertThat;
import java.util.ArrayList;

import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.session.jdbc.initialize-schema=always"
})
public class ProfileRepositoryQueryTest {

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    public void setup() {
        profileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    public void testGithubCollision_JamesAndJamesBond() {
        User user1 = new User();
        user1.setEmail("jamesbond@test.com");
        user1.setUserName("jamesbond");
        user1 = userRepository.save(user1);

        Profile p1 = new Profile();
        p1.setUser(user1);
        p1.setUserName("jamesbond");
        p1.setSocials(new ArrayList<>(List.of("GITHUB:jamesbond")));
        profileRepository.save(p1);

        List<String> owners = profileRepository.findUserNameByGithub("james");
        assertThat(owners).isEmpty(); // james should not match jamesbond

        List<String> validOwners = profileRepository.findUserNameByGithub("jamesbond");
        assertThat(validOwners).containsExactly("jamesbond");
    }

    @Test
    public void testLinkedinSuffixCollision() {
        User user1 = new User();
        user1.setEmail("jamesbond@test.com");
        user1.setUserName("jamesbond");
        user1 = userRepository.save(user1);

        Profile p1 = new Profile();
        p1.setUser(user1);
        p1.setUserName("jamesbond");
        p1.setSocials(new ArrayList<>(List.of("LINKEDIN:https://linkedin.com/in/jamesbond")));
        profileRepository.save(p1);

        List<String> owners = profileRepository.findUserNameByLinkedin("james");
        assertThat(owners).isEmpty(); // should not match
    }

    @Test
    public void testLinkedinPrefixCollision() {
        User user1 = new User();
        user1.setEmail("oldjames@test.com");
        user1.setUserName("oldjames");
        user1 = userRepository.save(user1);

        Profile p1 = new Profile();
        p1.setUser(user1);
        p1.setUserName("oldjames");
        p1.setSocials(new ArrayList<>(List.of("LINKEDIN:https://linkedin.com/in/oldjames")));
        profileRepository.save(p1);

        List<String> owners = profileRepository.findUserNameByLinkedin("james");
        assertThat(owners).isEmpty(); // should not match
    }

    @Test
    public void testLinkedinWildcardInjectionEscape() {
        User user1 = new User();
        user1.setEmail("james@test.com");
        user1.setUserName("james");
        user1 = userRepository.save(user1);

        Profile p1 = new Profile();
        p1.setUser(user1);
        p1.setUserName("james");
        p1.setSocials(new ArrayList<>(List.of("LINKEDIN:https://linkedin.com/in/james")));
        profileRepository.save(p1);

        // Simulated wildcard injection
        String escapedInjection = "ja\\_es"; // This would be the escaped string passed by ProfileService
        List<String> owners = profileRepository.findUserNameByLinkedin(escapedInjection);
        assertThat(owners).isEmpty(); // should not match
    }

    @Test
    public void testLinkedinLegitimateMatch() {
        User user1 = new User();
        user1.setEmail("james@test.com");
        user1.setUserName("james");
        user1 = userRepository.save(user1);

        Profile p1 = new Profile();
        p1.setUser(user1);
        p1.setUserName("james");
        p1.setSocials(new ArrayList<>(List.of("LINKEDIN:https://linkedin.com/in/james/")));
        profileRepository.save(p1);

        List<String> owners = profileRepository.findUserNameByLinkedin("james");
        assertThat(owners).containsExactly("james");
    }

    @Test
    public void testGithubExactMatchSanity() {
        User user1 = new User();
        user1.setEmail("james@test.com");
        user1.setUserName("james");
        user1 = userRepository.save(user1);

        Profile p1 = new Profile();
        p1.setUser(user1);
        p1.setUserName("james");
        p1.setSocials(new ArrayList<>(List.of("GITHUB:james")));
        profileRepository.save(p1);

        List<String> owners = profileRepository.findUserNameByGithub("James");
        assertThat(owners).containsExactly("james"); // case-insensitive equality
    }
}
