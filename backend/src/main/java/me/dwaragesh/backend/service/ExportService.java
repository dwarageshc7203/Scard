package me.dwaragesh.backend.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import me.dwaragesh.backend.model.Badge;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.model.enums.Platform;
import me.dwaragesh.backend.repository.BadgeRepository;
import me.dwaragesh.backend.repository.ProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Map;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    private final ProfileRepository profileRepository;
    private final BadgeRepository badgeRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public ExportService(ProfileRepository profileRepository, BadgeRepository badgeRepository) {
        this.profileRepository = profileRepository;
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

        List<Badge> badges = badgeRepository.findByProfileProfileId(profile.getProfileId());

        StringBuilder heatmapHtml = new StringBuilder();
        try {
            List<Map<String, Object>> contributions = mapper.readValue(
                profile.getHeatmapJson() != null ? profile.getHeatmapJson() : "[]", 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            for (Map<String, Object> c : contributions) {
                int count = c.get("count") != null ? (Integer) c.get("count") : 0;
                String date = (String) c.get("contributionDate");
                int intensity = Math.min(count, 10) * 25;
                heatmapHtml.append(String.format(
                        "<div style='width:10px;height:10px;display:inline-block;background:rgb(%d,%d,%d);margin:1px;' title='%s: %d'></div>",
                        255 - intensity, 255, 255 - intensity, date, count));
            }
        } catch (Exception e) {
            heatmapHtml.append("<p>Error loading heatmap data</p>");
        }

        StringBuilder badgesHtml = new StringBuilder();
        for (Badge b : badges) {
            badgesHtml.append("<div style='display:inline-block;margin:4px;padding:8px;border:1px solid #ccc;'>")
                    .append(org.springframework.web.util.HtmlUtils.htmlEscape(b.getBadgeName())).append("</div>");
        }

        String safeUsername = org.springframework.web.util.HtmlUtils.htmlEscape(profile.getUserName());
        String safeDesignation = profile.getDesignation() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(profile.getDesignation()) : "";

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
            """.formatted(safeUsername, safeDesignation, heatmapHtml, badgesHtml);
    }
}