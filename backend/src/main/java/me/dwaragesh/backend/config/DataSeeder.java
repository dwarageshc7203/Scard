package me.dwaragesh.backend.config;

import me.dwaragesh.backend.model.Banner;
import me.dwaragesh.backend.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DataSeeder implements CommandLineRunner {

    private final BannerRepository bannerRepository;

    public DataSeeder(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (bannerRepository.count() == 0) {
            List<Banner> banners = List.of(
                new Banner(null, "Cosmic Void", "linear-gradient(to right, #434343 0%, black 100%)"),
                new Banner(null, "Deep Space", "linear-gradient(to bottom, #0f2027, #203a43, #2c5364)"),
                new Banner(null, "Sunset Vibes", "linear-gradient(to right, #ff7e5f, #feb47b)"),
                new Banner(null, "Ocean Breeze", "linear-gradient(to top, #48c6ef 0%, #6f86d6 100%)"),
                new Banner(null, "Neon Lights", "linear-gradient(to right, #b224ef 0%, #7579ff 100%)"),
                new Banner(null, "Midnight City", "linear-gradient(to bottom, #141E30, #243B55)"),
                new Banner(null, "Cherry Blossom", "linear-gradient(to right, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)"),
                new Banner(null, "Aurora", "linear-gradient(to top, #0fd850 0%, #f9f047 100%)"),
                new Banner(null, "Starry Night", "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1000&q=80')"),
                new Banner(null, "Liquid Abstract", "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80')"),
                new Banner(null, "Mountain Abstract", "url('/banners/mountain-abstract.jpg')"),
                new Banner(null, "Fog", "url('/banners/fog.jpg')"),
                new Banner(null, "Mountains", "url('/banners/mountains.jpg')")
            );
            bannerRepository.saveAll(banners);
            log.info("Seeded {} predefined banners.", banners.size());
        }
    }
}
