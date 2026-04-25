package com.system.storage;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class DataManagerTest {

    @Test
    void appendEntry_onNewFile_writesHeaderAndRow(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        dm.appendHistoryEntry("p1", "2024-01-01T00:00:00Z", "liked", List.of("tax", "econ"));

        List<String> lines = Files.readAllLines(dir.resolve("history.csv"));
        assertThat(lines.get(0)).isEqualTo("titleId,timestamp,voteStatus,tags");
        assertThat(lines.get(1)).contains("p1").contains("liked").contains("tax|econ");
    }

    @Test
    void appendEntry_twice_noDuplicateHeader(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        dm.appendHistoryEntry("p1", "2024-01-01T00:00:00Z", "liked", List.of());
        dm.appendHistoryEntry("p2", "2024-01-02T00:00:00Z", "disliked", List.of());

        List<String> lines = Files.readAllLines(dir.resolve("history.csv"));
        assertThat(lines).hasSize(3);
        assertThat(lines.get(0)).isEqualTo("titleId,timestamp,voteStatus,tags");
    }

    @Test
    void appendEntry_emptyTags_tagsColumnEmpty(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        dm.appendHistoryEntry("p1", "2024-01-01T00:00:00Z", "liked", List.of());

        String row = Files.readAllLines(dir.resolve("history.csv")).get(1);
        assertThat(row).endsWith(",");
    }

    @Test
    void appendEntry_withTags_joinsWithPipe(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        dm.appendHistoryEntry("p1", "2024-01-01T00:00:00Z", "liked", List.of("a", "b", "c"));

        String row = Files.readAllLines(dir.resolve("history.csv")).get(1);
        assertThat(row).contains("a|b|c");
    }

    @Test
    void readByStatus_returnsMostRecentMatchingIds(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        dm.appendHistoryEntry("p1", "2024-01-01T00:00:00Z", "liked", List.of());
        dm.appendHistoryEntry("p2", "2024-01-02T00:00:00Z", "disliked", List.of());
        dm.appendHistoryEntry("p3", "2024-01-03T00:00:00Z", "liked", List.of());

        List<String> liked = dm.readHistoryIdsByStatus("liked", 10);
        assertThat(liked).containsExactly("p1", "p3");
        assertThat(dm.readHistoryIdsByStatus("disliked", 10)).containsExactly("p2");
    }

    @Test
    void readByStatus_limitsCap(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        for (int i = 1; i <= 5; i++) {
            dm.appendHistoryEntry("p" + i, "2024-01-01T00:00:00Z", "liked", List.of());
        }
        assertThat(dm.readHistoryIdsByStatus("liked", 3)).hasSize(3);
    }

    @Test
    void readByStatus_missingFile_returnsEmpty(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("nonexistent.csv").toString());
        assertThat(dm.readHistoryIdsByStatus("liked", 10)).isEmpty();
    }

    @Test
    void deleteEntry_removesMatchingRow_keepsOthers(@TempDir Path dir) throws IOException {
        DataManager dm = new DataManager(dir.resolve("history.csv").toString());
        dm.appendHistoryEntry("p1", "2024-01-01T00:00:00Z", "liked", List.of());
        dm.appendHistoryEntry("p2", "2024-01-02T00:00:00Z", "disliked", List.of());

        dm.deleteHistoryEntry("p1");

        List<String> lines = Files.readAllLines(dir.resolve("history.csv"));
        assertThat(lines).hasSize(2);
        assertThat(lines.get(1)).startsWith("p2");
    }

    @Test
    void deleteEntry_missingFile_doesNotThrow(@TempDir Path dir) {
        DataManager dm = new DataManager(dir.resolve("nonexistent.csv").toString());
        assertThatCode(() -> dm.deleteHistoryEntry("p1")).doesNotThrowAnyException();
    }
}
