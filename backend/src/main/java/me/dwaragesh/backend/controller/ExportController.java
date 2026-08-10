package me.dwaragesh.backend.controller;

import me.dwaragesh.backend.service.ExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @GetMapping("/api/profile/{userName}/export")
    public ResponseEntity<byte[]> exportPdf(@PathVariable String userName) throws Exception {
        byte[] pdf = exportService.exportPdf(userName);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + userName + "-scard.pdf\"")
                .body(pdf);
    }
}