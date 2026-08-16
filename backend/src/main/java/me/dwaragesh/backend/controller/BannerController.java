package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Banner;
import me.dwaragesh.backend.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    @org.springframework.beans.factory.annotation.Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        List<Banner> banners = new java.util.ArrayList<>(bannerRepository.findAll());
        try {
            java.nio.file.Path dir = java.nio.file.Paths.get(uploadDir);
            if (java.nio.file.Files.exists(dir)) {
                java.io.File[] files = dir.toFile().listFiles();
                if (files != null) {
                    int counter = banners.size() + 1;
                    for (java.io.File file : files) {
                        String name = file.getName().toLowerCase();
                        if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png") || name.endsWith(".gif")) {
                            // Don't include profile pictures as banners
                            if (!name.startsWith("pfp-")) {
                                Banner b = new Banner(counter++, file.getName(), "url('/api/images/" + file.getName() + "')");
                                banners.add(b);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.ok(banners);
    }
}
