package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.dto.ProfileResponse;
import me.dwaragesh.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PublicProfileController {

    @Autowired
    private ProfileService service;

    @GetMapping("/api/profile/{userName}")
    public ProfileResponse getPublicProfile(@PathVariable String userName) {
        return service.getProfile(userName);
    }

    @GetMapping("/api/profiles")
    public List<ProfileResponse> getAllProfiles() {
        return service.getAllProfiles();
    }
}
