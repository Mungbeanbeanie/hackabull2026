/*
    * The decision-maker. It decides whether to search
    * the whole library, a specific "Neighborhood," or a pre-defined "Catalog."
*/

package com.system.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.system.bridge.InferencePayload;
import com.system.bridge.PythonRunner;
import com.system.models.PoliFigure;
import com.system.models.UserProfile;
import com.system.sampler.userNegPreference;

import java.util.ArrayList;
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
        List<InferencePayload.Candidate>  candidates  = buildCandidates();

        List<Double> userVector = floatToDoubleList(profile.getUserVector());
        List<Double> weights    = floatToDoubleList(profile.getWeights());

        InferencePayload.Request request = new InferencePayload.Request(
            userVector,
            weights,
            useAdherence,
            candidates,
            constraints,
            seenIds
        );

        return pythonRunner.run(request);
    }

    private List<InferencePayload.Constraint> buildConstraints() throws Exception {
        String boundsJson = negPreference.getExclusionBounds();
        JsonNode root     = MAPPER.readTree(boundsJson);
        JsonNode bounds   = root.path("bounds");

        List<InferencePayload.Constraint> constraints = new ArrayList<>();
        for (JsonNode b : bounds) {
            constraints.add(new InferencePayload.Constraint(
                b.get("dim").asInt(),
                b.get("lower").asDouble(),
                b.get("upper").asDouble()
            ));
        }
        return constraints;
    }

    private List<InferencePayload.Candidate> buildCandidates() {
        List<InferencePayload.Candidate> candidates = new ArrayList<>();
        for (PoliFigure figure : libraryIndexer.getAllFigures()) {
            candidates.add(new InferencePayload.Candidate(
                figure.id,
                floatToDoubleList(figure.vector.toArray())
            ));
        }
        return candidates;
    }

    private static List<Double> floatToDoubleList(float[] arr) {
        List<Double> list = new ArrayList<>(arr.length);
        for (float v : arr) list.add((double) v);
        return list;
    }
}
