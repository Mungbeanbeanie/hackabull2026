package com.system;

import com.system.bridge.PythonRunner;
import com.system.controllers.RequestHandler;
import com.system.managers.LibraryIndexer;
import com.system.managers.SearchController;
import com.system.sampler.userNegPreference;
import com.system.storage.DataManager;

import java.nio.file.Files;
import java.nio.file.Path;

public class App {

    // Loads backend/java-chassis/.env into JVM system properties so getProperty() fallbacks resolve
    private static void loadEnv() {
        Path envFile = Path.of("backend/java-chassis/.env");
        if (!Files.exists(envFile)) return;
        try {
            Files.lines(envFile).forEach(line -> {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) return;
                String[] parts = line.split("=", 2);
                System.setProperty(parts[0].trim(), parts[1].trim());
            });
        } catch (Exception e) {
            System.err.println("[App] Failed to load .env: " + e.getMessage());
        }
    }

    public static void main(String[] args) throws Exception {
        loadEnv();

        int port = 8080;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            port = Integer.parseInt(envPort.trim());
        }

        DataManager       dataManager  = new DataManager();
        LibraryIndexer    indexer      = new LibraryIndexer();
        if (indexer.size() == 0) SeedData.seed(indexer);
        PythonRunner      python       = new PythonRunner();
        userNegPreference negPref      = new userNegPreference(dataManager, indexer, python);
        SearchController  controller   = new SearchController(indexer, negPref, python);
        RequestHandler    handler      = new RequestHandler(controller, port);

        Runtime.getRuntime().addShutdownHook(new Thread(handler::stop));

        handler.start();
        System.out.println("SERVER_PORT=" + handler.getPort());
    }
}
