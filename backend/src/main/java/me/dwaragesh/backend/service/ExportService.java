package me.dwaragesh.backend.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Contribution;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.enums.Platform;
import me.dwaragesh.backend.repository.BadgeRepository;
import me.dwaragesh.backend.repository.ContributionRepository;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    private final ProfileRepository profileRepository;
    private final ContributionRepository contributionRepository;
    private final BadgeRepository badgeRepository;

    public ExportService(ProfileRepository profileRepository, ContributionRepository contributionRepository, BadgeRepository badgeRepository) {
        this.profileRepository = profileRepository;
        this.contributionRepository = contributionRepository;
        this.badgeRepository = badgeRepository;
    }

    public byte[] exportPdf(String userName) throws Exception {
        String html = buildHtml(userName);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.withHtmlContent(html, null);
        builder.toStream(out);
        builder.run();
        return out.toByteArray();
    }

    private String buildHtml(String userName) {
        Profile profile = profileRepository.findFirstByUserName(userName)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<Contribution> contributions = contributionRepository
                .findByProfileProfileIdAndPlatform(profile.getProfileId(), Platform.GITHUB);
        List<Badge> badges = badgeRepository.findByProfileProfileId(profile.getProfileId());

        StringBuilder heatmapHtml = new StringBuilder();
        for (Contribution c : contributions) {
            int intensity = Math.min(c.getCount(), 10) * 25;
            heatmapHtml.append(String.format(
                    "<div style='width:10px;height:10px;display:inline-block;background:rgb(%d,%d,%d);margin:1px;' title='%s: %d'></div>",
                    255 - intensity, 255, 255 - intensity, c.getContributionDate(), c.getCount()));
        }

        StringBuilder badgesHtml = new StringBuilder();
        for (Badge b : badges) {
            badgesHtml.append("<div style='display:inline-block;margin:4px;padding:8px;border:1px solid #ccc;'>")
                    .append(b.getBadgeName()).append("</div>");
        }

        return """
            <html>
            <body style="font-family: sans-serif; padding: 20px;">
                <h1>%s</h1>
                <p>%s</p>
                <h2>Contributions</h2>
                <div>%s</div>
                <h2>Badges</h2>
                <div>%s</div>
            </body>
            </html>
            """.formatted(profile.getUserName(), profile.getDesignation(), heatmapHtml, badgesHtml);
    }
}