/*
    * The "Gatekeeper." The only file that reads/writes the CSVs (eventually mongoDB) in the /data folder
    * basically keeps the important data safe from corruption and messy logic
    * later when move to a real database chng to SqlDatabaseManager.java logic
*/

package com.system.storage;

import java.io.*;
import java.nio.file.*;
import java.util.*;

public class DataManager {

    private static final String DEFAULT_PATH = "data/cache/user_history.csv";
    private static final String HISTORY_HEADER = "titleId,timestamp,voteStatus,tags";
    private final String historyPath;

    public DataManager() {
        this.historyPath = DEFAULT_PATH;
    }

    /* package-private — inject path for tests */
    DataManager(String historyPath) {
        this.historyPath = historyPath;
    }

    public void appendHistoryEntry(String titleId, String timestamp, String voteStatus, List<String> tags) throws IOException {
        File file = new File(historyPath);
        boolean isNew = !file.exists() || file.length() == 0;

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file, true))) {
            if (isNew) {
                writer.write(HISTORY_HEADER);
                writer.newLine();
            }
            String tagStr = (tags == null || tags.isEmpty()) ? "" : String.join("|", tags);
            writer.write(String.join(",", titleId, timestamp, voteStatus, tagStr));
            writer.newLine();
        }
    }

    // returns last `limit` titleIds with matching voteStatus (most recent first)
    public List<String> readHistoryIdsByStatus(String voteStatus, int limit) throws IOException {
        File file = new File(historyPath);
        if (!file.exists()) return Collections.emptyList();

        List<String> matched = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            boolean header = true;
            while ((line = reader.readLine()) != null) {
                if (header) { header = false; continue; }
                String[] parts = line.split(",", 4);
                if (parts.length >= 3 && parts[2].equals(voteStatus)) {
                    matched.add(parts[0]);
                }
            }
        }

        int from = Math.max(0, matched.size() - limit);
        return matched.subList(from, matched.size());
    }

    public void deleteHistoryEntry(String titleId) throws IOException {
        File file = new File(historyPath);
        if (!file.exists()) return;

        Path path = file.toPath();
        List<String> lines = Files.readAllLines(path);
        List<String> kept = new ArrayList<>();
        boolean header = true;
        for (String line : lines) {
            if (header) { kept.add(line); header = false; continue; }
            String[] parts = line.split(",", 2);
            if (parts.length == 0 || !parts[0].equals(titleId)) {
                kept.add(line);
            }
        }
        Files.write(path, kept);
    }
}
