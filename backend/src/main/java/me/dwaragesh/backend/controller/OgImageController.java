package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Banner;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import lombok.extern.slf4j.Slf4j;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.Optional;

@Slf4j
@RestController
public class OgImageController {

    private final ProfileRepository profileRepository;

    public OgImageController(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Anything outside this list is silently skipped; the fallback rendering
     * path (gradient / initial-letter avatar) handles it gracefully.
     *
     * <p>Never pass an arbitrary DB-stored URL to URLConnection without checking here.
     */
    private static final java.util.List<String> TRUSTED_URL_PREFIXES = java.util.List.of(
            "https://images.unsplash.com/",
            "https://lh3.googleusercontent.com/",
            "https://avatars.githubusercontent.com/",
            "https://i.imgur.com/"
    );

    private static boolean isTrustedUrl(String url) {
        if (url == null) return false;
        return TRUSTED_URL_PREFIXES.stream().anyMatch(url::startsWith);
    }

    @GetMapping(value = {"/api/og/{userName}.png", "/api/og/{userName}"}, produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateOgImage(@PathVariable String userName) {
        if (userName != null && userName.endsWith(".png")) {
            userName = userName.substring(0, userName.length() - 4);
        }
        try {
            Optional<Profile> profileOpt = profileRepository.findFirstByUserName(userName);
            if (profileOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Profile profile = profileOpt.get();
            String displayName = (profile.getProfileName() != null && !profile.getProfileName().trim().isEmpty())
                    ? profile.getProfileName()
                    : profile.getUserName();
            String handle = "@" + profile.getUserName();

            // OG Image Dimensions (standard 1200 x 630)
            int width = 1200;
            int height = 630;

            BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g2d = image.createGraphics();

            // Enable high quality rendering hints
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

            // 1. Draw Background / Banner
            Banner banner = profile.getBanner();
            boolean bannerDrawn = false;

            if (banner != null && banner.getCssBackground() != null) {
                String bg = banner.getCssBackground();
                if (bg.contains("url(")) {
                    try {
                        String imageUrl = bg.replaceAll(".*url\\(['\"]?([^'\")]+)['\"]?\\).*", "$1");
                        BufferedImage bannerImg = null;
                        if (imageUrl.startsWith("http")) {
                            if (!isTrustedUrl(imageUrl)) {
                                log.warn("Blocked SSRF attempt for banner URL: {}", imageUrl);
                                // Fall through to gradient/default background
                            } else {
                                java.net.URLConnection conn = new URL(imageUrl).openConnection();
                                conn.setConnectTimeout(3000);
                                conn.setReadTimeout(5000);
                                conn.setRequestProperty("User-Agent", "Mozilla/5.0");
                                bannerImg = ImageIO.read(conn.getInputStream());
                            }
                        } else if (imageUrl.startsWith("/")) {
                            java.io.File bannerFile = new java.io.File("./static" + imageUrl);
                            if (!bannerFile.exists()) {
                                bannerFile = new java.io.File("/app/static" + imageUrl);
                            }
                            if (bannerFile.exists()) {
                                bannerImg = ImageIO.read(bannerFile);
                            }
                        }
                        if (bannerImg != null) {
                            double scale = Math.max((double) width / bannerImg.getWidth(), (double) height / bannerImg.getHeight());
                            int w = (int) (bannerImg.getWidth() * scale);
                            int h = (int) (bannerImg.getHeight() * scale);
                            int x = (width - w) / 2;
                            int y = (height - h) / 2;
                            g2d.drawImage(bannerImg, x, y, w, h, null);
                            bannerDrawn = true;
                        }
                    } catch (Exception ignored) {
                    }
                } else if (bg.contains("linear-gradient")) {
                    try {
                        java.util.regex.Matcher m = java.util.regex.Pattern.compile("#[a-fA-F0-9]{3,6}|rgba?\\([0-9,\\s\\.]+\\)|black|white|blue|red|purple").matcher(bg);
                        java.util.List<Color> colors = new java.util.ArrayList<>();
                        while (m.find()) {
                            String match = m.group();
                            if (match.equalsIgnoreCase("black")) colors.add(Color.BLACK);
                            else if (match.equalsIgnoreCase("white")) colors.add(Color.WHITE);
                            else if (match.startsWith("#")) {
                                String hex = match;
                                if (hex.length() == 4) {
                                    hex = "#" + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2) + hex.charAt(3) + hex.charAt(3);
                                }
                                colors.add(Color.decode(hex));
                            }
                        }
                        if (colors.size() >= 2) {
                            // Check gradient direction (to right vs to bottom/top)
                            boolean isHorizontal = bg.contains("to right");
                            int x2 = isHorizontal ? width : 0;
                            int y2 = isHorizontal ? 0 : height;
                            
                            GradientPaint grad = new GradientPaint(0, 0, colors.get(0), x2, y2, colors.get(colors.size() - 1));
                            g2d.setPaint(grad);
                            g2d.fillRect(0, 0, width, height);
                            bannerDrawn = true;
                        }
                    } catch (Exception ignored) {
                    }
                }
            }

            if (!bannerDrawn) {
                GradientPaint defaultBg = new GradientPaint(0, 0, new Color(20, 30, 48), width, height, new Color(36, 59, 85));
                g2d.setPaint(defaultBg);
                g2d.fillRect(0, 0, width, height);
            }

            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.25f));
            g2d.setColor(Color.BLACK);
            g2d.fillRect(0, 0, width, height);
            g2d.setComposite(AlphaComposite.SrcOver);

            // 2. Center-Left PFP Avatar
            int avatarSize = 220;
            int avatarX = 90;
            int avatarY = (height - avatarSize) / 2;

            BufferedImage avatarImg = null;
            String avatarUrl = profile.getCustomImageUrl();
            if (avatarUrl == null && profile.getUser() != null) {
                avatarUrl = profile.getUser().getImageURL();
            }

            if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
                try {
                    if (avatarUrl.startsWith("http")) {
                        if (!isTrustedUrl(avatarUrl)) {
                            log.warn("Blocked SSRF attempt for avatar URL: {}", avatarUrl);
                            avatarUrl = null; // fall through to initials fallback
                        } else {
                            java.net.URLConnection conn = new URL(avatarUrl).openConnection();
                            conn.setConnectTimeout(3000);
                            conn.setReadTimeout(5000);
                            conn.setRequestProperty("User-Agent", "Mozilla/5.0");
                            avatarImg = ImageIO.read(conn.getInputStream());
                        }
                    } else {
                        String filename = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
                        java.nio.file.Path file = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
                        if (java.nio.file.Files.exists(file)) {
                            avatarImg = ImageIO.read(file.toFile());
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            if (avatarImg != null) {
                BufferedImage circleAvatar = new BufferedImage(avatarSize, avatarSize, BufferedImage.TYPE_INT_ARGB);
                Graphics2D gAvatar = circleAvatar.createGraphics();
                gAvatar.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                gAvatar.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                
                // Circular clipping path
                gAvatar.setClip(new Ellipse2D.Float(0, 0, avatarSize, avatarSize));
                
                // Crop and scale keeping aspect ratio
                double scale = Math.max((double) avatarSize / avatarImg.getWidth(), (double) avatarSize / avatarImg.getHeight());
                int w = (int) (avatarImg.getWidth() * scale);
                int h = (int) (avatarImg.getHeight() * scale);
                int x = (avatarSize - w) / 2;
                int y = (avatarSize - h) / 2;
                
                gAvatar.drawImage(avatarImg, x, y, w, h, null);
                
                // Subtle, dimmed border around circular avatar
                gAvatar.setClip(null);
                gAvatar.setStroke(new BasicStroke(2.5f));
                gAvatar.setColor(new Color(255, 255, 255, 100));
                gAvatar.drawOval(1, 1, avatarSize - 2, avatarSize - 2);
                
                gAvatar.dispose();

                g2d.drawImage(circleAvatar, avatarX, avatarY, null);
            } else {
                // Initial Letter Avatar Fallback
                g2d.setColor(new Color(30, 41, 59));
                g2d.fillOval(avatarX, avatarY, avatarSize, avatarSize);
                g2d.setStroke(new BasicStroke(4.0f));
                g2d.setColor(new Color(255, 255, 255, 180));
                g2d.drawOval(avatarX + 2, avatarY + 2, avatarSize - 4, avatarSize - 4);
                
                g2d.setColor(Color.WHITE);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 90));
                FontMetrics fm = g2d.getFontMetrics();
                String initial = String.valueOf(displayName.charAt(0)).toUpperCase();
                int ix = avatarX + (avatarSize - fm.stringWidth(initial)) / 2;
                int iy = avatarY + ((avatarSize - fm.getHeight()) / 2) + fm.getAscent();
                g2d.drawString(initial, ix, iy);
            }

            // 3. Center-Right Display Name and Username Text
            int textX = avatarX + avatarSize + 50;

            // Display Name
            g2d.setFont(new Font("SansSerif", Font.BOLD, 60));
            g2d.setColor(Color.WHITE);
            FontMetrics nameFm = g2d.getFontMetrics();
            int nameY = (height / 2) - 10;
            g2d.drawString(displayName, textX, nameY);

            // Username (@handle)
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 36));
            g2d.setColor(new Color(226, 232, 240));
            g2d.drawString(handle, textX, nameY + nameFm.getHeight() + 8);

            // Designation / Title (if present)
            if (profile.getDesignation() != null && !profile.getDesignation().trim().isEmpty()) {
                g2d.setFont(new Font("SansSerif", Font.PLAIN, 28));
                g2d.setColor(new Color(148, 163, 184));
                g2d.drawString(profile.getDesignation(), textX, nameY + nameFm.getHeight() + 54);
            }

            // Clean Scard Branding Tag (Bottom Right)
            g2d.setFont(new Font("SansSerif", Font.BOLD, 24));
            g2d.setColor(new Color(255, 255, 255, 140));
            g2d.drawString("scard.dwaragesh.me", width - 310, height - 40);

            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            byte[] bytes = baos.toByteArray();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .contentType(MediaType.IMAGE_PNG)
                    .body(bytes);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
