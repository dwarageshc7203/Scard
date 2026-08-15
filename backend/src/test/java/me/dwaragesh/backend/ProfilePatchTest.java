package me.dwaragesh.backend;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import me.dwaragesh.backend.service.ProfileService;
import me.dwaragesh.backend.model.*;
import me.dwaragesh.backend.model.dto.*;
import me.dwaragesh.backend.repository.*;
import java.util.*;

@SpringBootTest
public class ProfilePatchTest {
    @Autowired ProfileService profileService;
    @Autowired UserRepository userRepository;
    @Test
    public void testPatch() {
        User user = new User();
        user.setEmail("test2@example.com");
        user.setUserName("test2");
        user = userRepository.save(user);
        
        Profile p = new Profile();
        p.setUser(user);
        p.setUserName("test2");
        user.setProfile(p);
        userRepository.save(user);
        
        List<Project> projs = new ArrayList<>();
        Project p1 = new Project(); p1.setName("Proj1"); projs.add(p1);
        
        PatchProfileRequest req = new PatchProfileRequest("Dev", "url", "test2", "test2@example.com", "ascii", 1, Arrays.asList("t:t"), null, null, null, projs);
        
        profileService.patchProfile(user, req);
    }
}
