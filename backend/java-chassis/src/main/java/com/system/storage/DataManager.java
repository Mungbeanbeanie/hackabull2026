/*
    * The "Gatekeeper." The only class that reads/writes user_history in MongoDB.
    * Keeps history data safe from corruption and messy logic elsewhere.
*/

package com.system.storage;

import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Sorts;
import org.bson.Document;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.mongodb.client.model.Filters.eq;

public class DataManager {

    private static final String DEFAULT_URI = "mongodb://localhost:27017";
    private static final String DB_NAME     = "civic_info";
    private static final String COLLECTION  = "user_history";

    private final MongoClient              client;
    private final MongoCollection<Document> collection;

    public DataManager() {
        String uri = System.getenv("MONGODB_URI");
        if (uri == null || uri.isBlank()) uri = DEFAULT_URI;
        this.client     = MongoClients.create(uri);
        this.collection = client.getDatabase(DB_NAME).getCollection(COLLECTION);
    }

    /* package-private — inject collection for tests */
    DataManager(MongoCollection<Document> collection) {
        this.client     = null;
        this.collection = collection;
    }

    public void appendHistoryEntry(String titleId, String timestamp, String voteStatus, List<String> tags) throws IOException {
        try {
            Document doc = new Document("titleId", titleId)
                    .append("timestamp", timestamp)
                    .append("voteStatus", voteStatus)
                    .append("tags", tags != null ? tags : List.of());
            collection.insertOne(doc);
        } catch (MongoException e) {
            throw new IOException("appendHistoryEntry failed: " + e.getMessage(), e);
        }
    }

    // returns last `limit` titleIds with matching voteStatus (oldest-to-newest of the tail)
    public List<String> readHistoryIdsByStatus(String voteStatus, int limit) throws IOException {
        try {
            List<String> ids = new ArrayList<>();
            collection.find(eq("voteStatus", voteStatus))
                      .sort(Sorts.ascending("_id"))
                      .forEach(doc -> ids.add(doc.getString("titleId")));
            int from = Math.max(0, ids.size() - limit);
            return ids.subList(from, ids.size());
        } catch (MongoException e) {
            throw new IOException("readHistoryIdsByStatus failed: " + e.getMessage(), e);
        }
    }

    public void deleteHistoryEntry(String titleId) throws IOException {
        try {
            collection.deleteOne(eq("titleId", titleId));
        } catch (MongoException e) {
            throw new IOException("deleteHistoryEntry failed: " + e.getMessage(), e);
        }
    }
}
