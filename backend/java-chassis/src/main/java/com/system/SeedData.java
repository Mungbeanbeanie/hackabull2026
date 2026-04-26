package com.system;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.system.managers.LibraryIndexer;
import com.system.models.PoliFigure;
import com.system.models.PoliVector;

import java.io.File;

public class SeedData {

    private static final String SEED_PATH = "data/seed/politicians.json";

    public static void seed(LibraryIndexer indexer) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode records = mapper.readTree(new File(SEED_PATH));
            for (JsonNode r : records) {
                JsonNode vNode = r.get("vector");
                JsonNode wNode = r.get("adherence_weights");

                float[] v = new float[20];
                float[] w = new float[20];
                for (int i = 0; i < 20; i++) {
                    v[i] = vNode.get(i).floatValue();
                    w[i] = wNode != null ? wNode.get(i).floatValue() : 1.0f;
                }

                indexer.addFigure(new PoliFigure(
                    r.get("id").asText(),
                    r.get("name").asText(),
                    r.get("party").asText(),
                    r.get("state").asText(),
                    r.get("office").asText(),
                    new PoliVector(
                        v[0],  v[1],  v[2],  v[3],  v[4],
                        v[5],  v[6],  v[7],  v[8],  v[9],
                        v[10], v[11], v[12], v[13], v[14],
                        v[15], v[16], v[17], v[18], v[19]
                    ),
                    w,
                    r.has("image_url") && !r.get("image_url").isNull() ? r.get("image_url").asText() : null
                ));
            }
        } catch (Exception e) {
            System.err.println("[SeedData] Failed to load " + SEED_PATH + ": " + e.getMessage());
        }
    }
}
