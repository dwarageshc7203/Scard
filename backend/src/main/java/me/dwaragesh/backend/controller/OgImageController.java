package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.model.Banner;
import me.dwaragesh.backend.model.Profile;
import me.dwaragesh.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.Ellipse2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.Optional;

@RestController
public class OgImageController {

    @Autowired
    private ProfileRepository profileRepository;

    @GetMapping(value = "/api/og/{userName}.png", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generateOgImage(@PathVariable String userName) {
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
                        String imageUrl = bg.substring(bg.indexOf("url('") + 5, bg.indexOf("')"));
                        if (imageUrl.startsWith("http")) {
                            BufferedImage bannerImg = ImageIO.read(new URL(imageUrl));
                            if (bannerImg != null) {
                                g2d.drawImage(bannerImg, 0, 0, width, height, null);
                                bannerDrawn = true;
                            }
                        }
                    } catch (Exception ignored) {
                    }
                } else if (bg.contains("linear-gradient")) {
                    // Render linear gradient background fallback
                    GradientPaint grad = new GradientPaint(0, 0, new Color(40, 40, 50), width, height, new Color(15, 23, 42));
                    g2d.setPaint(grad);
                    g2d.fillRect(0, 0, width, height);
                    bannerDrawn = true;
                }
            }

            if (!bannerDrawn) {
                // Dark cosmic gradient default
                GradientPaint defaultBg = new GradientPaint(0, 0, new Color(20, 30, 48), width, height, new Color(36, 59, 85));
                g2d.setPaint(defaultBg);
                g2d.fillRect(0, 0, width, height);
            }

            // Dark semi-transparent overlay for contrast
            g2d.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, 0.45f));
            g2d.setColor(Color.BLACK);
            g2d.fillRect(0, 0, width, height);
            g2d.setComposite(AlphaComposite.SrcOver);

            // 2. Center-Left PFP Avatar (Size: 220x220, Pos: X=100, Y=205)
            int avatarSize = 220;
            int avatarX = 100;
            int avatarY = (height - avatarSize) / 2;

            BufferedImage avatarImg = null;
            String avatarUrl = profile.getCustomImageUrl();
            if (avatarUrl == null && profile.getUser() != null) {
                avatarUrl = profile.getUser().getImageURL();
            }

            if (avatarUrl != null) {
                try {
                    if (avatarUrl.startsWith("http")) {
                        avatarImg = ImageIO.read(new URL(avatarUrl));
                    } else if (avatarUrl.startsWith("/uploads/") || avatarUrl.startsWith("uploads/")) {
                        String cleanPath = avatarUrl.startsWith("/") ? avatarUrl.substring(1) : avatarUrl;
                        java.io.File file = new java.io.File(cleanPath);
                        if (!file.exists()) {
                            file = new java.io.File("./uploads/" + cleanPath.replace("uploads/", ""));
                        }
                        if (file.exists()) {
                            avatarImg = ImageIO.read(file);
                        }
                    }
                } catch (Exception ignored) {
                }
            }

            // Draw white ring background around avatar
            g2d.setColor(new Color(255, 255, 255, 60));
            g2d.fillOval(avatarX - 8, avatarY - 8, avatarSize + 16, avatarSize + 16);

            if (avatarImg != null) {
                BufferedImage circleAvatar = new BufferedImage(avatarSize, avatarSize, BufferedImage.TYPE_INT_ARGB);
                Graphics2D gAvatar = circleAvatar.createGraphics();
                gAvatar.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                gAvatar.setClip(new Ellipse2D.Float(0, 0, avatarSize, avatarSize));
                gAvatar.drawImage(avatarImg, 0, 0, avatarSize, avatarSize, null);
                gAvatar.dispose();

                g2d.drawImage(circleAvatar, avatarX, avatarY, null);
            } else {
                // Initial Letter Avatar Fallback
                g2d.setColor(new Color(40, 40, 50));
                g2d.fillOval(avatarX, avatarY, avatarSize, avatarSize);
                g2d.setColor(Color.WHITE);
                g2d.setFont(new Font("SansSerif", Font.BOLD, 90));
                FontMetrics fm = g2d.getFontMetrics();
                String initial = String.valueOf(displayName.charAt(0)).toUpperCase();
                int ix = avatarX + (avatarSize - fm.stringWidth(initial)) / 2;
                int iy = avatarY + ((avatarSize - fm.getHeight()) / 2) + fm.getAscent();
                g2d.drawString(initial, ix, iy);
            }

            // 3. Center-Right Display Name and Username Text
            int textX = avatarX + avatarSize + 60;

            // Display Name
            g2d.setFont(new Font("SansSerif", Font.BOLD, 64));
            g2d.setColor(Color.WHITE);
            FontMetrics nameFm = g2d.getFontMetrics();
            int nameY = (height / 2) - 15;
            g2d.drawString(displayName, textX, nameY);

            // Username (@handle)
            g2d.setFont(new Font("SansSerif", Font.PLAIN, 38));
            g2d.setColor(new Color(200, 210, 225));
            g2d.drawString(handle, textX, nameY + nameFm.getHeight() + 10);

            // Designation / Title (if present)
            if (profile.getDesignation() != null && !profile.getDesignation().trim().isEmpty()) {
                g2d.setFont(new Font("SansSerif", Font.PLAIN, 30));
                g2d.setColor(new Color(170, 180, 200));
                g2d.drawString(profile.getDesignation(), textX, nameY + nameFm.getHeight() + 60);
            }

            // Scard Branding Tag (Bottom Right)
            g2d.setFont(new Font("SansSerif", Font.BOLD, 26));
            g2d.setColor(new Color(255, 255, 255, 180));
            g2d.drawString("scard.dwaragesh.me", width - 280, height - 50);

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
