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
            method = ImageUploadService.class.getDeclaredMethod("validateAndGetExtension", MultipartFile.class);
            method.setAccessible(true);
            java.lang.reflect.InvocationTargetException ex = assertThrows(java.lang.reflect.InvocationTargetException.class, () -> {
                method.invoke(service, file);
            });
            assertTrue(ex.getCause() instanceof IllegalArgumentException);
            assertTrue(ex.getCause().getMessage().contains("Uploaded file is not a supported image"));
        } catch (NoSuchMethodException e) {
            fail(e);
        }
    }
}
