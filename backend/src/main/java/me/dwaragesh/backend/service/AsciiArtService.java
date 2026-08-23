package me.dwaragesh.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class AsciiArtService {

    private static final String RAMP = "@%#*+=-:. "; // darkest to lightest
    private static final int GRID_WIDTH = 100;   // characters wide
    private static final int GRID_HEIGHT = 100;  // characters tall
    private static final int CHAR_PIXEL_SIZE = 8; // output image scale per character

    @Value("${app.upload.dir}")
    private String uploadDir;

    /** Step 1: image -> ASCII text grid */
    public String generateAsciiText(InputStream imageStream) throws IOException {
        BufferedImage original = ImageIO.read(imageStream);
        if (original == null) {
            throw new IllegalArgumentException("Could not read image — unsupported or corrupt file");
        }
        BufferedImage resized = resize(original, GRID_WIDTH, GRID_HEIGHT);

        StringBuilder ascii = new StringBuilder();
        for (int y = 0; y < resized.getHeight(); y++) {
            for (int x = 0; x < resized.getWidth(); x++) {
                int gray = toGrayscale(resized.getRGB(x, y));
                int rampIndex = gray * (RAMP.length() - 1) / 255;
                ascii.append(RAMP.charAt(rampIndex));
            }
            ascii.append("\n");
        }
        return ascii.toString();
    }

    /** Step 2: ASCII text -> rendered PNG, saved to disk, returns the public URL path */
    public String renderAndSave(String asciiText, String filenamePrefix) throws IOException {
        String[] lines = asciiText.split("\n");
        int width = lines[0].length() * CHAR_PIXEL_SIZE;
        int height = lines.length * CHAR_PIXEL_SIZE;

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, width, height);
        g.setColor(Color.BLACK);
        g.setFont(new Font(Font.MONOSPACED, Font.PLAIN, CHAR_PIXEL_SIZE));

        for (int row = 0; row < lines.length; row++) {
            g.drawString(lines[row], 0, (row + 1) * CHAR_PIXEL_SIZE);
        }
        g.dispose();

        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = filenamePrefix + "-" + UUID.randomUUID() + ".png";
        File outFile = new File(dir, filename);
        ImageIO.write(image, "png", outFile);

        return "/uploads/" + filename;
    }

    private static final java.util.Set<String> ALLOWED_CONTENT_TYPES =
            java.util.Set.of("image/png", "image/jpeg", "image/gif", "image/webp");

    private static final java.util.Map<byte[], String> MAGIC_BYTES = new java.util.LinkedHashMap<>() {{
        put(new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF}, "image/jpeg");
        put(new byte[]{(byte)0x89, 0x50, 0x4E, 0x47}, "image/png");
        put(new byte[]{0x47, 0x49, 0x46, 0x38}, "image/gif");
        put(new byte[]{0x52, 0x49, 0x46, 0x46}, "image/webp"); // RIFF header
    }};

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds the 5MB limit");
        }
        // Validate by magic bytes — not the user-controlled Content-Type header
        try {
            byte[] header = new byte[12];
            try (java.io.InputStream is = file.getInputStream()) {
                int bytesRead = is.read(header);
                if (bytesRead < 4) {
                    throw new IllegalArgumentException("File too small to be a valid image");
                }
            }
            boolean validMagic = false;
            for (java.util.Map.Entry<byte[], String> entry : MAGIC_BYTES.entrySet()) {
                byte[] magic = entry.getKey();
                boolean matches = true;
                for (int i = 0; i < magic.length && i < header.length; i++) {
                    if (header[i] != magic[i]) { matches = false; break; }
                }
                if (matches) { validMagic = true; break; }
            }
            if (!validMagic) {
                throw new IllegalArgumentException("Uploaded file is not a supported image (PNG, JPEG, GIF, WebP)");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not validate image file: " + e.getMessage());
        }
    }

    /** Convenience: does both steps for a MultipartFile upload */
    public String processUpload(MultipartFile file, String filenamePrefix) throws IOException {
        validateImage(file);
        String asciiText = generateAsciiText(file.getInputStream());
        return renderAndSave(asciiText, filenamePrefix);
    }

    /** Saves a raw image directly to disk for normal profile pictures */
    public String saveRawImage(MultipartFile file, String filenamePrefix) throws IOException {
        validateImage(file);
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String extension = ".png";
        String contentType = file.getContentType();
        if (contentType != null) {
            if (contentType.equals("image/jpeg")) {
                extension = ".jpg";
            } else if (contentType.equals("image/gif")) {
                extension = ".gif";
            } else if (contentType.equals("image/webp")) {
                extension = ".webp";
            }
        }

        String filename = filenamePrefix + "-" + UUID.randomUUID() + extension;
        File outFile = new File(dir, filename);
        Files.copy(file.getInputStream(), outFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + filename;
    }

    private BufferedImage resize(BufferedImage original, int width, int height) {
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.drawImage(original, 0, 0, width, height, null);
        g.dispose();
        return resized;
    }

    private int toGrayscale(int rgb) {
        int r = (rgb >> 16) & 0xFF;
        int g = (rgb >> 8) & 0xFF;
        int b = rgb & 0xFF;
        return (int) (0.299 * r + 0.587 * g + 0.114 * b); // luminance-weighted, not flat average
    }
}