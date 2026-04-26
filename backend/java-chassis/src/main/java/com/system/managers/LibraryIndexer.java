/*
    * The core "Spatial Map." RAM index backed by MongoDB `politicians` collection.
    * Loads all figures from MongoDB on boot; writes persist to both RAM and DB.
*/

package com.system.managers;

import com.mongodb.MongoException;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Projections;
import com.mongodb.client.model.ReplaceOptions;
import com.system.models.PoliFigure;
import com.system.models.PoliVector;
import org.bson.Document;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.mongodb.client.model.Filters.eq;

public class LibraryIndexer {

    public record AtlasResult(String id, double score) {}

    private static final String DEFAULT_URI   = "mongodb://localhost:27017";
    private static final String DB_NAME       = "civic_info";
    private static final String COLLECTION    = "politicians";
    private static final String VECTOR_INDEX  = "vector_index";

    private final MongoClient              client;
    private final MongoCollection<Document> collection;
    private final Map<String, PoliFigure>  index   = new HashMap<>();
    private final List<PoliFigure>         figures = new ArrayList<>();

    public LibraryIndexer() {
        String uri = System.getenv("MONGODB_URI");
        if (uri == null || uri.isBlank()) uri = DEFAULT_URI;
        this.client     = MongoClients.create(uri);
        this.collection = client.getDatabase(DB_NAME).getCollection(COLLECTION);
        loadFromDb();
    }

    /* package-private — inject collection for tests */
    LibraryIndexer(MongoCollection<Document> collection) {
        this.client     = null;
        this.collection = collection;
        loadFromDb();
    }

    public void addFigure(PoliFigure figure) {
        if (figure == null || figure.id == null) return;
        boolean isNew = !index.containsKey(figure.id);
        try {
            collection.replaceOne(eq("_id", figure.id), toDocument(figure), new ReplaceOptions().upsert(true));
        } catch (MongoException e) {
            System.err.println("[LibraryIndexer] MongoDB write failed for " + figure.id + ": " + e.getMessage());
        }
        index.put(figure.id, figure);
        if (isNew) figures.add(figure);
    }

    public PoliFigure lookupById(String id) {
        return index.get(id);
    }

    public PoliVector lookupVector(String id) {
        PoliFigure figure = index.get(id);
        return figure != null ? figure.vector : null;
    }

    public float[] lookupAdherenceWeights(String id) {
        PoliFigure figure = index.get(id);
        return figure != null ? figure.adherenceWeights : null;
    }

    public List<PoliFigure> getAllFigures() {
        return Collections.unmodifiableList(figures);
    }

    public int size() {
        return figures.size();
    }

    public List<AtlasResult> searchByVector(List<Double> queryVector, int limit) {
        try {
            int numCandidates = Math.max(limit * 10, 150);
            Document vectorSearchStage = new Document("$vectorSearch",
                new Document("index", VECTOR_INDEX)
                    .append("path", "vector")
                    .append("queryVector", queryVector)
                    .append("numCandidates", numCandidates)
                    .append("limit", limit)
            );
            Document projectStage = new Document("$project",
                new Document("score", new Document("$meta", "vectorSearchScore"))
            );

            List<AtlasResult> results = new ArrayList<>();
            for (Document doc : collection.aggregate(Arrays.asList(vectorSearchStage, projectStage))) {
                String id    = doc.getString("_id");
                Double score = doc.getDouble("score");
                results.add(new AtlasResult(id, score != null ? score : 0.0));
            }
            return results;
        } catch (MongoException e) {
            throw new UnsupportedOperationException("Atlas Vector Search unavailable: " + e.getMessage());
        }
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private void loadFromDb() {
        try {
            for (Document doc : collection.find()) {
                try {
                    PoliFigure figure = fromDocument(doc);
                    index.put(figure.id, figure);
                    figures.add(figure);
                } catch (Exception e) {
                    System.err.println("[LibraryIndexer] Skipping malformed document: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("[LibraryIndexer] DB load failed, starting empty: " + e.getMessage());
        }
    }

    private static Document toDocument(PoliFigure figure) {
        float[] arr = figure.vector.toArray();
        List<Double> vector = new ArrayList<>(arr.length);
        for (float v : arr) vector.add((double) v);

        List<Double> adherenceWeights = new ArrayList<>(20);
        for (float w : figure.adherenceWeights) adherenceWeights.add((double) w);

        Document doc = new Document("_id", figure.id)
                .append("name",             figure.name)
                .append("party",            figure.party)
                .append("state",            figure.state)
                .append("office",           figure.office)
                .append("vector",           vector)
                .append("adherence_weights", adherenceWeights);
        if (figure.imageUrl != null) doc.append("image_url", figure.imageUrl);
        return doc;
    }

    @SuppressWarnings("unchecked")
    private static PoliFigure fromDocument(Document doc) {
        String id     = doc.getString("_id");
        String name   = doc.getString("name");
        String party  = doc.getString("party");
        String state  = doc.getString("state");
        String office = doc.getString("office");

        List<Double> v = (List<Double>) doc.get("vector");
        PoliVector vector = new PoliVector(
            v.get(0).floatValue(),  v.get(1).floatValue(),  v.get(2).floatValue(),  v.get(3).floatValue(),
            v.get(4).floatValue(),  v.get(5).floatValue(),  v.get(6).floatValue(),  v.get(7).floatValue(),
            v.get(8).floatValue(),  v.get(9).floatValue(),  v.get(10).floatValue(), v.get(11).floatValue(),
            v.get(12).floatValue(), v.get(13).floatValue(), v.get(14).floatValue(), v.get(15).floatValue(),
            v.get(16).floatValue(), v.get(17).floatValue(), v.get(18).floatValue(), v.get(19).floatValue()
        );

        float[] adherenceWeights = new float[20];
        List<Double> aw = (List<Double>) doc.get("adherence_weights");
        if (aw != null && aw.size() == 20) {
            for (int i = 0; i < 20; i++) adherenceWeights[i] = aw.get(i).floatValue();
        } else {
            Arrays.fill(adherenceWeights, 1.0f);
        }

        String imageUrl = doc.getString("image_url");
        return new PoliFigure(id, name, party, state, office, vector, adherenceWeights, imageUrl);
    }
}
