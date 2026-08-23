package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class OgProfileHtmlController {

    @Autowired
    private ProfileRepository profileRepository;

    @Value("${app.frontend.url:https://scard.dwaragesh.me}")
    private String baseUrl;

    private static final java.util.List<String> BOT_USER_AGENTS = java.util.List.of(
            "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp",
            "telegrambot", "slackbot", "discordbot", "pinterest", "bingbot"
    );

    @GetMapping(value = "/{userName}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> getProfileHtml(
            @PathVariable String userName,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {

        if (userName.contains(".") || userName.startsWith("api") || userName.startsWith("assets")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        boolean isBot = false;
        if (userAgent != null) {
            String lower = userAgent.toLowerCase();
            isBot = BOT_USER_AGENTS.stream().anyMatch(lower::contains);
        }

        if (!isBot) {
            // For normal users, redirect or let frontend SPA route handle it
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", baseUrl + "/" + userName)
                    .build();
        }

        Optional<Profile> profileOpt = profileRepository.findFirstByUserName(userName);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("<html><body>Profile not found</body></html>");
        }

        Profile profile = profileOpt.get();
        String displayName = (profile.getProfileName() != null && !profile.getProfileName().trim().isEmpty())
                ? profile.getProfileName()
                : profile.getUserName();
        String title = displayName + " (@" + profile.getUserName() + ") | Scard";
        String description = profile.getDesignation() != null && !profile.getDesignation().trim().isEmpty()
                ? profile.getDesignation()
                : "Check out @" + profile.getUserName() + "'s developer profile on Scard.";

        String ogImageUrl = baseUrl + "/api/og/" + profile.getUserName() + ".png";
        String profilePageUrl = baseUrl + "/" + profile.getUserName();

        String html = "<!doctype html>\n" +
                "<html lang=\"en\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>" + escapeHtml(title) + "</title>\n" +
                "  <meta name=\"description\" content=\"" + escapeHtml(description) + "\">\n" +
                "  <meta property=\"og:type\" content=\"profile\">\n" +
                "  <meta property=\"og:title\" content=\"" + escapeHtml(title) + "\">\n" +
                "  <meta property=\"og:description\" content=\"" + escapeHtml(description) + "\">\n" +
                "  <meta property=\"og:url\" content=\"" + profilePageUrl + "\">\n" +
                "  <meta property=\"og:image\" content=\"" + ogImageUrl + "\">\n" +
                "  <meta property=\"og:image:width\" content=\"1200\">\n" +
                "  <meta property=\"og:image:height\" content=\"630\">\n" +
                "  <meta name=\"twitter:card\" content=\"summary_large_image\">\n" +
                "  <meta name=\"twitter:title\" content=\"" + escapeHtml(title) + "\">\n" +
                "  <meta name=\"twitter:description\" content=\"" + escapeHtml(description) + "\">\n" +
                "  <meta name=\"twitter:image\" content=\"" + ogImageUrl + "\">\n" +
                "</head>\n" +
                "<body>\n" +
                "  <h1>" + escapeHtml(title) + "</h1>\n" +
                "  <p>" + escapeHtml(description) + "</p>\n" +
                "</body>\n" +
                "</html>";

        return ResponseEntity.ok(html);
    }

    private String escapeHtml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
