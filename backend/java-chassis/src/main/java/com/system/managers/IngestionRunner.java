/*
    *A one-time script that calls the APIs, 
    * runs them through the LLM for scoring, and tells DataManager to SAVE them to the DB.
    * for now should only be used to call until demoTarget.json is met for this prototype, 
    * but can be extended to a more general "ingestion pipeline" in the future if desired.
*/

package com.system.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.system.api.ApiDispatcher;
import com.system.api.WikimediaOAuthClient;
import com.system.api.congressGovApi;
import com.system.api.googleCivicInfoApi;
import com.system.api.legiscanApi;
import com.system.api.openFecApi;
import com.system.api.openStatesApi;
import com.system.api.wikimediaApi;
import com.system.api.wikipediaRestApi;
import com.system.bridge.PythonRunner;
import com.system.models.PoliFigure;
import com.system.models.PoliVector;

import java.io.File;
import java.util.*;

public class IngestionRunner {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    public static void main(String[] args) {
        com.system.EnvLoader.load();

        // Init Hardware/Logic layers
        ApiDispatcher api = new ApiDispatcher(
            new googleCivicInfoApi(),
            new openStatesApi(),
            new congressGovApi(),
            new openFecApi(),
            new wikimediaApi(new WikimediaOAuthClient()),
            new legiscanApi()
        );
        wikipediaRestApi wikipedia = new wikipediaRestApi();
        PythonRunner python = new PythonRunner();
        LibraryIndexer indexer = new LibraryIndexer(); // Loads MongoDB/Cache on init

        try {
            // 1. Parse demoTarget.json
            JsonNode root = MAPPER.readTree(new File("backend/shared/demoTarget.json"));
            JsonNode targets = root.get("targets");

            int successCount = 0;

            for (JsonNode target : targets) {
                String id = target.get("id").asText();
                String name = target.get("name").asText();

                // 2. Skip if already indexed (Rigid System Check)
                if (indexer.lookupById(id) != null) {
                    System.out.println("[SKIP] " + name + ": Already indexed.");
                    continue;
                }

                try {
                    // 3. Harvest/Merge data
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("name", name);
                    metadata.put("party", target.get("party").asText());
                    metadata.put("state", target.get("state").asText());

                    String osId = target.has("openStatesId") ? target.get("openStatesId").asText() : null;
                    List<String> positions = new ArrayList<>();
                    target.get("positions").forEach(p -> positions.add(p.asText()));

                    if (osId != null && !osId.equals("<null>")) {
                        Map<String, Object> apiData = api.getLegislativeData(osId);
                        metadata.put("bio", apiData.getOrDefault("biography", target.get("bio").asText()));
                        // Merge API positions if they exist
                    } else {
                        metadata.put("bio", target.get("bio").asText());
                    }
                    metadata.put("positions", positions);

                    // 4. Vectorize via Python Bridge
                    String payload = MAPPER.writeValueAsString(metadata);
                    String result = python.run("backend/inference-engine/tagging/llm_analyst.py", payload);

                    JsonNode vectorNode = MAPPER.readTree(result);

                    // Construct PoliVector (Ensure d1-d20 order matches constructor)
                    float[] d = new float[20];
                    for (int i = 1; i <= 20; i++) {
                        d[i-1] = (float) vectorNode.get("d" + i).asDouble();
                    }
                    PoliVector vector = new PoliVector(
                        d[0],  d[1],  d[2],  d[3],  d[4],  d[5],  d[6],  d[7],  d[8],  d[9],
                        d[10], d[11], d[12], d[13], d[14], d[15], d[16], d[17], d[18], d[19]
                    );

                    // 4b. Compute adherence weights via weight_calculator.py
                    //     Proxy history: two copies of stated vector (real voting history not yet available)
                    List<Double> statedVec = new ArrayList<>();
                    for (float fv : d) statedVec.add((double) fv);
                    Map<String, Object> wcPayload = new HashMap<>();
                    wcPayload.put("vectors", List.of(statedVec, statedVec));
                    String wcResult = python.run("backend/inference-engine/math/weight_calculator.py", MAPPER.writeValueAsString(wcPayload));
                    JsonNode wcNode = MAPPER.readTree(wcResult);
                    float[] adherenceWeights = new float[20];
                    JsonNode wArr = wcNode.get("weights");
                    for (int i = 0; i < 20; i++) adherenceWeights[i] = (float) wArr.get(i).asDouble();

                    // 5. Commit to Library (and DB via LibraryIndexer internal DataManager)
                    String imageUrl = wikipedia.fetchImageUrl(name);
                    PoliFigure figure = new PoliFigure(id, name, metadata.get("party").toString(),
                                                       metadata.get("state").toString(),
                                                       target.get("office").asText(), vector, adherenceWeights, imageUrl);
                    
                    indexer.addFigure(figure);
                    System.out.println("[OK] Ingested: " + name);
                    successCount++;

                } catch (Exception e) {
                    System.err.println("[FAIL] " + name + ": " + e.getMessage());
                }
            }

            System.out.println("--- Ingestion Complete: " + successCount + "/" + targets.size() + " new figures ---");

            // Patch pass: backfill imageUrl for any figure that was ingested without one
            int patched = 0;
            for (PoliFigure existing : indexer.getAllFigures()) {
                if (existing.imageUrl != null) continue;
                String imageUrl = wikipedia.fetchImageUrl(existing.name);
                if (imageUrl == null) continue;
                PoliFigure updated = new PoliFigure(
                    existing.id, existing.name, existing.party, existing.state,
                    existing.office, existing.vector, existing.adherenceWeights, imageUrl
                );
                indexer.addFigure(updated);
                patched++;
            }
            if (patched > 0) System.out.println("--- Image Patch Complete: " + patched + " figures updated ---");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}