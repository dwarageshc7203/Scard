package me.dwaragesh.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageUploadService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final java.util.Set<String> ALLOWED_CONTENT_TYPES =
            java.util.Set.of("image/png", "image/jpeg", "image/gif", "image/webp");

    private static final java.util.Map<byte[], String> MAGIC_BYTES = new java.util.LinkedHashMap<>() {{
        put(new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF}, "image/jpeg");
        put(new byte[]{(byte)0x89, 0x50, 0x4E, 0x47}, "image/png");
        put(new byte[]{0x47, 0x49, 0x46, 0x38}, "image/gif");
        put(new byte[]{0x52, 0x49, 0x46, 0x46}, "image/webp"); // RIFF header
    }};

    private String validateAndGetExtension(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds the 5MB limit");
        }
        try {
            byte[] header = new byte[12];
            try (java.io.InputStream is = file.getInputStream()) {
                int bytesRead = is.read(header);
                if (bytesRead < 4) {
                    throw new IllegalArgumentException("File too small to be a valid image");
                }
            }
            for (java.util.Map.Entry<byte[], String> entry : MAGIC_BYTES.entrySet()) {
                byte[] magic = entry.getKey();
                boolean matches = true;
                for (int i = 0; i < magic.length && i < header.length; i++) {
                    if (header[i] != magic[i]) { matches = false; break; }
                }
                if (matches) { 
                    String mime = entry.getValue();
                    return switch (mime) {
                        case "image/jpeg" -> ".jpg";
                        case "image/png" -> ".png";
                        case "image/gif" -> ".gif";
                        case "image/webp" -> ".webp";
                        default -> ".png";
                    };
                }
            }
            throw new IllegalArgumentException("Uploaded file is not a supported image (PNG, JPEG, GIF, WebP)");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not validate image file: " + e.getMessage());
        }
    }

    public String saveRawImage(MultipartFile file, String filenamePrefix) throws IOException {
        String extension = validateAndGetExtension(file);
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = filenamePrefix + "-" + UUID.randomUUID() + extension;
        File outFile = new File(dir, filename);
        Files.copy(file.getInputStream(), outFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + filename;
    }
}
