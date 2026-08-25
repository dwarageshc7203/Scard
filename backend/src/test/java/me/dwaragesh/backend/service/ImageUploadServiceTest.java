package me.dwaragesh.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class ImageUploadServiceTest {

    private ImageUploadService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new ImageUploadService();
        java.lang.reflect.Field uploadDirField = ImageUploadService.class.getDeclaredField("uploadDir");
        uploadDirField.setAccessible(true);
        uploadDirField.set(service, "target/test-uploads");
    }

    @Test
    void testValidateAndGetExtension_validPng() throws Exception {
        // PNG magic bytes
        byte[] content = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
        MultipartFile file = new MockMultipartFile("file", "test.png", "image/png", content);
        
        java.lang.reflect.Method method = ImageUploadService.class.getDeclaredMethod("validateAndGetExtension", MultipartFile.class);
        method.setAccessible(true);
        String ext = (String) method.invoke(service, file);
        assertEquals(".png", ext);
    }

    @Test
    void testValidateAndGetExtension_invalidFile() {
        // Random bytes
        byte[] content = new byte[]{0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B};
        MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", content);
        
        java.lang.reflect.Method method;
        try {
            method = ImageUploadService.class.getDeclaredMethod("validateAndGetExtension", byte[].class);
            method.setAccessible(true);
            java.lang.reflect.InvocationTargetException ex = assertThrows(java.lang.reflect.InvocationTargetException.class, () -> {
                method.invoke(service, content);
            });
            assertTrue(ex.getCause() instanceof IllegalArgumentException);
            assertTrue(ex.getCause().getMessage().contains("Uploaded file is not a supported image"));
        } catch (NoSuchMethodException e) {
            fail(e);
        }
    }

    @Test
    void testDeleteImage_validPath() throws Exception {
        java.nio.file.Path testDir = java.nio.file.Paths.get("target/test-uploads").toAbsolutePath().normalize();
        java.nio.file.Files.createDirectories(testDir);
        java.nio.file.Path testFile = testDir.resolve("test-delete.png");
        java.nio.file.Files.write(testFile, new byte[]{1,2,3});
        assertTrue(java.nio.file.Files.exists(testFile));

        service.deleteImage("/api/images/test-delete.png");
        
        assertFalse(java.nio.file.Files.exists(testFile));
    }

    @Test
    void testDeleteImage_traversalAttack() throws Exception {
        java.nio.file.Path testDir = java.nio.file.Paths.get("target/test-uploads").toAbsolutePath().normalize();
        java.nio.file.Files.createDirectories(testDir);
        java.nio.file.Path secretFile = testDir.getParent().resolve("secret.txt");
        java.nio.file.Files.write(secretFile, new byte[]{1,2,3});
        assertTrue(java.nio.file.Files.exists(secretFile));

        service.deleteImage("/api/images/../secret.txt");
        
        // Should not be deleted
        assertTrue(java.nio.file.Files.exists(secretFile));
        java.nio.file.Files.deleteIfExists(secretFile);
    }

    @Test
    void testSaveRawImage_validPng() throws Exception {
        byte[] validPng = new byte[]{
            (byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte)0xC4, (byte)0x89, 
            0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 
            0x78, (byte)0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 
            0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte)0xB4, 0x00, 0x00, 
            0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte)0xAE, 0x42, 0x60, (byte)0x82
        };
        MultipartFile file = new MockMultipartFile("file", "test.png", "image/png", validPng);
        
        String url = service.saveRawImage(file, "pfp-test");
        
        assertTrue(url.startsWith("/api/images/pfp-test-"));
        assertTrue(url.endsWith(".png"));
        
        String filename = url.substring("/api/images/".length());
        java.nio.file.Path testDir = java.nio.file.Paths.get("target/test-uploads").toAbsolutePath().normalize();
        java.nio.file.Path savedFile = testDir.resolve(filename);
        
        assertTrue(java.nio.file.Files.exists(savedFile));
    }
}
