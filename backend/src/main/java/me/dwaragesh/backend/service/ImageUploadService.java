package me.dwaragesh.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.util.Iterator;

@Service
public class ImageUploadService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private static final java.util.Set<String> ALLOWED_CONTENT_TYPES =
            java.util.Set.of("image/png", "image/jpeg");

    private static final java.util.Map<byte[], String> MAGIC_BYTES = new java.util.LinkedHashMap<>() {{
        put(new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF}, "image/jpeg");
        put(new byte[]{(byte)0x89, 0x50, 0x4E, 0x47}, "image/png");
    }};

    private String validateAndGetExtension(byte[] fileBytes) {
        if (fileBytes.length == 0) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }
        if (fileBytes.length > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds the 5MB limit");
        }
        try {
            if (fileBytes.length < 4) {
                throw new IllegalArgumentException("File too small to be a valid image");
            }
            byte[] header = new byte[Math.min(fileBytes.length, 12)];
            System.arraycopy(fileBytes, 0, header, 0, header.length);
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
                        default -> ".png";
                    };
                }
            }
            throw new IllegalArgumentException("Uploaded file is not a supported image (PNG, JPEG)");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Could not validate image file: " + e.getMessage());
        }
    }

    public String saveRawImage(MultipartFile file, String filenamePrefix) throws IOException {
        byte[] fileBytes = file.getBytes();
        String extension = validateAndGetExtension(fileBytes);
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = filenamePrefix + "-" + UUID.randomUUID() + extension;
        File outFile = new File(dir, filename);

        int originalWidth = 0;
        int originalHeight = 0;
        
        try (java.io.InputStream rawIn = new java.io.ByteArrayInputStream(fileBytes);
             ImageInputStream iis = ImageIO.createImageInputStream(rawIn)) {
            if (iis != null) {
                Iterator<ImageReader> readers = ImageIO.getImageReaders(iis);
                if (readers.hasNext()) {
                    ImageReader reader = readers.next();
                    try {
                        reader.setInput(iis, true, true);
                        originalWidth = reader.getWidth(0);
                        originalHeight = reader.getHeight(0);
                        
                        if (originalWidth > 4000 || originalHeight > 4000) {
                            throw new IllegalArgumentException("Image dimensions too large (max 4000x4000)");
                        }
                    } finally {
                        reader.dispose();
                    }
                }
            }
        }

        boolean shouldResize = originalWidth > 512 || originalHeight > 512;

        try (java.io.InputStream rawIn = new java.io.ByteArrayInputStream(fileBytes)) {
            if (".png".equals(extension)) {
                var builder = net.coobird.thumbnailator.Thumbnails.of(rawIn);
                if (shouldResize) {
                    builder.size(512, 512);
                } else {
                    builder.scale(1.0);
                }
                builder.useExifOrientation(true).toFile(outFile);
            } else {
                var builder = net.coobird.thumbnailator.Thumbnails.of(rawIn);
                if (shouldResize) {
                    builder.size(512, 512);
                } else {
                    builder.scale(1.0);
                }
                builder.useExifOrientation(true)
                       .outputQuality(0.85)
                       .outputFormat("jpg")
                       .toFile(outFile);
            }
        }

        return "/api/images/" + filename;
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl != null && imageUrl.startsWith("/api/images/")) {
            String filename = imageUrl.substring("/api/images/".length());
            try {
                java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
                java.nio.file.Path filePath = uploadPath.resolve(filename).toAbsolutePath().normalize();
                
                if (filePath.startsWith(uploadPath)) {
                    Files.deleteIfExists(filePath);
                }
            } catch (IOException e) {
                // Ignore if it fails to delete, orphaned file is better than breaking the flow
            }
        }
    }
}
