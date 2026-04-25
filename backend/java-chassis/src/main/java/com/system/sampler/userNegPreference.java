/*
    * Handles dislike/blacklist sampling — produces the exclusion signal
    *
    * Step 1: Pull last 20 disliked politician IDs from user_history.csv (via DataManager)
    * Step 2: Resolve those IDs to actual PoliVectors via LibraryIndexer
    * Step 3: Pass vectors to constraint_discoverer.py via PythonRunner
    *
    * constraint_discoverer.py finds the 3 alleles with lowest σ across those vectors
    * (most consistent signal of what the user hates) and returns lower/upper bounds per allele.
    * inference_manager.py uses those bounds to pre-filter candidates BEFORE cosine_sim runs —
    * any candidate whose value falls inside a hated range is dropped without touching cosine math.
*/

package com.system.sampler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.system.bridge.PythonRunner;
import com.system.managers.LibraryIndexer;
import com.system.models.PoliVector;
import com.system.storage.DataManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class userNegPreference {

    private static final String CONSTRAINT_SCRIPT = "backend/inference-engine/math/constraint_discoverer.py";
    private static final int    DISLIKE_LIMIT     = 20;

    private final DataManager    dataManager;
    private final LibraryIndexer libraryIndexer;
    private final PythonRunner   pythonRunner;

    public userNegPreference(DataManager dataManager, LibraryIndexer libraryIndexer, PythonRunner pythonRunner) {
        this.dataManager    = dataManager;
        this.libraryIndexer = libraryIndexer;
        this.pythonRunner   = pythonRunner;
    }

    // Returns raw JSON from constraint_discoverer.py: {"bounds": [{dim, lower, upper}, ...]}
    public String getExclusionBounds() throws Exception {
        List<String> dislikedIds = dataManager.readHistoryIdsByStatus("dislike", DISLIKE_LIMIT);
        if (dislikedIds.isEmpty()) return "{\"bounds\": []}";

        List<float[]> vectors = new ArrayList<>();
        for (String id : dislikedIds) {
            PoliVector v = libraryIndexer.lookupVector(id);
            if (v != null) vectors.add(v.toArray());
        }
        if (vectors.isEmpty()) return "{\"bounds\": []}";

        String payload = new ObjectMapper().writeValueAsString(Map.of("vectors", vectors));
        return pythonRunner.run(CONSTRAINT_SCRIPT, payload);
    }
}