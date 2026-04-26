/*
    * The decision-maker. It decides whether to search
    * the whole library, a specific "Neighborhood," or a pre-defined "Catalog."
*/

package com.system.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.system.bridge.InferencePayload;
import com.system.bridge.PythonRunner;
import com.system.managers.LibraryIndexer.AtlasResult;
import com.system.models.PoliFigure;
import com.system.models.UserProfile;
import com.system.sampler.userNegPreference;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class SearchController {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final LibraryIndexer     libraryIndexer;
    private final userNegPreference  negPreference;
    private final PythonRunner       pythonRunner;

    public SearchController(LibraryIndexer libraryIndexer, userNegPreference negPreference, PythonRunner pythonRunner) {
        this.libraryIndexer = libraryIndexer;
        this.negPreference  = negPreference;
        this.pythonRunner   = pythonRunner;
    }

    // Full-library scan: score every figure in the index against the user profile
    public InferencePayload.Response search(UserProfile profile, boolean useAdherence, List<String> seenIds) throws Exception {
        List<InferencePayload.Constraint> constraints = buildConstraints();
        List<Double> userVector = floatToDoubleList(profile.getUserVector());
        List<Double> weights    = Collections.nCopies(20, 1.0); // per-candidate adherence_weights now carry the signal

        if (!useAdherence) {
            try {
                return searchViaAtlas(userVector, seenIds, constraints);
            } catch (UnsupportedOperationException ignored) {
                // fall through to Python pipeline
            }
        }

        List<InferencePayload.Candidate> candidates = buildCandidates();
        InferencePayload.Request request = new InferencePayload.Request(
            userVector,
            weights,
            useAdherence,
            candidates,
            constraints,
            seenIds
        );
        try {
            return pythonRunner.run(request);
        } catch (Exception e) {
            System.err.println("[SearchController] Python inference failed, using Java fallback: " + e.getMessage());
            return javaFallbackSearch(userVector, useAdherence, candidates, constraints, seenIds);
        }
    } //search method end
    
    private InferencePayload.Response searchViaAtlas(
            List<Double> userVector,
            List<String> seenIds,
            List<InferencePayload.Constraint> constraints) {

        List<AtlasResult> atlasResults = libraryIndexer.searchByVector(userVector, 50);

        List<InferencePayload.Result> survivors = new ArrayList<>();
        for (AtlasResult r : atlasResults) {
            if (seenIds.contains(r.id())) continue;
            if (inHateZone(r.id(), constraints)) continue;
            InferencePayload.Result res = new InferencePayload.Result();
            res.id    = r.id();
            res.score = r.score();
            survivors.add(res);
            if (survivors.size() == 10) break;
        }

        InferencePayload.Response response = new InferencePayload.Response();
        response.results = survivors;
        return response;
    }

    private boolean inHateZone(String id, List<InferencePayload.Constraint> constraints) {
        if (constraints.isEmpty()) return false;
        float[] vec = libraryIndexer.lookupVector(id) != null
            ? libraryIndexer.lookupVector(id).toArray()
            : null;
        if (vec == null) return false;
        for (InferencePayload.Constraint c : constraints) {
            double v = vec[c.allele];
            if (v >= c.lower && v <= c.upper) return true;
        }
        return false;
    }

    private List<InferencePayload.Constraint> buildConstraints() throws Exception {
        String boundsJson = negPreference.getExclusionBounds();
        JsonNode root     = MAPPER.readTree(boundsJson);
        JsonNode bounds   = root.path("constraints");

        List<InferencePayload.Constraint> constraints = new ArrayList<>();
        for (JsonNode b : bounds) {
            constraints.add(new InferencePayload.Constraint(
                b.get("allele").asInt(),
                b.get("lower").asDouble(),
                b.get("upper").asDouble()
            ));
        }
        return constraints;
    }

    private List<InferencePayload.Candidate> buildCandidates() {
        List<InferencePayload.Candidate> candidates = new ArrayList<>();
        for (PoliFigure figure : libraryIndexer.getAllFigures()) {
            float[] aw = libraryIndexer.lookupAdherenceWeights(figure.id);
            List<Double> adherenceWeights = aw != null
                ? floatToDoubleList(aw)
                : Collections.nCopies(20, 1.0);
            candidates.add(new InferencePayload.Candidate(
                figure.id,
                floatToDoubleList(figure.vector.toArray()),
                adherenceWeights
            ));
        }
        return candidates;
    }

    private InferencePayload.Response javaFallbackSearch(
            List<Double> userVector,
            boolean useAdherence,
            List<InferencePayload.Candidate> candidates,
            List<InferencePayload.Constraint> constraints,
            List<String> seenIds) {

        List<InferencePayload.Result> results = new ArrayList<>();
        for (InferencePayload.Candidate c : candidates) {
            if (seenIds.contains(c.id)) continue;
            if (inHateZone(c.id, constraints)) continue;
            List<Double> w = (useAdherence && c.adherenceWeights != null)
                ? c.adherenceWeights
                : Collections.nCopies(20, 1.0);
            InferencePayload.Result r = new InferencePayload.Result();
            r.id    = c.id;
            r.score = weightedCosine(userVector, c.vector, w);
            results.add(r);
        }
        results.sort((a, b) -> Double.compare(b.score, a.score));

        InferencePayload.Response response = new InferencePayload.Response();
        response.results = new ArrayList<>(results.subList(0, Math.min(10, results.size())));
        return response;
    }

    private static double weightedCosine(List<Double> u, List<Double> v, List<Double> w) {
        double num = 0, du = 0, dv = 0;
        for (int i = 0; i < 20; i++) {
            double wi = w.get(i), ui = u.get(i), vi = v.get(i);
            num += wi * ui * vi;
            du  += wi * ui * ui;
            dv  += wi * vi * vi;
        }
        if (du == 0 || dv == 0) return 0;
        return Math.min(1.0, Math.max(-1.0, num / (Math.sqrt(du) * Math.sqrt(dv))));
    }

    public List<PoliFigure> getAllFigures() {
        return libraryIndexer.getAllFigures();
    }

    private static List<Double> floatToDoubleList(float[] arr) {
        List<Double> list = new ArrayList<>(arr.length);
        for (float v : arr) list.add((double) v);
        return list;
    }
}
