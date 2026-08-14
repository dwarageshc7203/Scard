package me.dwaragesh.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE profile ALTER COLUMN ascii_art TYPE TEXT;");
            System.out.println("Successfully migrated ascii_art column to TEXT.");
        } catch (Exception e) {
            System.out.println("Migration skipped or failed: " + e.getMessage());
        }
    }
}
