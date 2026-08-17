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

    /**
     * Returns only banners that exist in the database.
     * The previous implementation scanned the upload directory directly,
     * which leaked internal filenames of all uploaded files to unauthenticated callers.
     */
    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerRepository.findAll());
    }
}
