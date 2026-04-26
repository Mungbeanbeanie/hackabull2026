/*
 * Single source for .env parsing — loads backend/java-chassis/.env into JVM system properties.
 * Called once by any entry point (App, IngestionRunner) before env vars are read.
 */

package com.system;

import java.nio.file.Files;
import java.nio.file.Path;

public class EnvLoader {

    public static void load() {
        Path envFile = Path.of("backend/java-chassis/.env");
        if (!Files.exists(envFile)) return;
        try {
            Files.lines(envFile).forEach(rawLine -> {
                String line = rawLine.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) return;
                String[] parts = line.split("=", 2);
                System.setProperty(parts[0].trim(), parts[1].trim());
            });
        } catch (Exception e) {
            System.err.println("[EnvLoader] Failed to load .env: " + e.getMessage());
        }
    }
}
