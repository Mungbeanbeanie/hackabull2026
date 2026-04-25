/*
    * Logic manager for user support history — does NOT store data directly
    * All reads/writes to user_history.csv go through DataManager exclusively
    *
    * Responsibilities:
    *   - Add a new history entry (titleId, timestamp, voteStatus, tags) via DataManager
    *   - Query history entries by voteStatus (liked / disliked) for samplers
    *   - Remove or update an entry via DataManager
    *
    * Entry shape (passed to/from DataManager):
    *   titleId (String), timestamp (ISO-8601), voteStatus (String), tags (List<String>)
*/

package com.system.models;

import com.system.storage.DataManager;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

public class userSupportHistory {

    private final DataManager dataManager;

    public userSupportHistory(DataManager dataManager) {
        this.dataManager = dataManager;
    }

    public void addEntry(String titleId, String voteStatus, List<String> tags) throws IOException {
        String timestamp = Instant.now().toString();
        dataManager.appendHistoryEntry(titleId, timestamp, voteStatus, tags);
    }

    public List<String> getLikedIds(int limit) throws IOException {
        return dataManager.readHistoryIdsByStatus("liked", limit);
    }

    public List<String> getDislikedIds(int limit) throws IOException {
        return dataManager.readHistoryIdsByStatus("disliked", limit);
    }

    public void removeEntry(String titleId) throws IOException {
        dataManager.deleteHistoryEntry(titleId);
    }
}
