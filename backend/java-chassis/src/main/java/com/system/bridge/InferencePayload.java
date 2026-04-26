/*
    * Data contract for Java<->Python IPC via PythonRunner
    * Defines the JSON structure sent to inference_manager.py:
    *   user_vector, candidate_vectors, weights, constraints
    * Also models the response: ranked figure IDs + scores
*/
package com.system.bridge;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class InferencePayload {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ── Request ──────────────────────────────────────────────────────────────

    public static class Request {
        @JsonProperty("user_vector")       public final List<Double>     userVector;
        @JsonProperty("adherence_weights") public final List<Double>     adherenceWeights;
        @JsonProperty("use_adherence")     public final boolean          useAdherence;
        @JsonProperty("candidates")        public final List<Candidate>  candidates;
        @JsonProperty("constraints")       public final List<Constraint> constraints;
        @JsonProperty("seen_ids")          public final List<String>     seenIds;

        public Request(
            List<Double>     userVector,
            List<Double>     adherenceWeights,
            boolean          useAdherence,
            List<Candidate>  candidates,
            List<Constraint> constraints,
            List<String>     seenIds
        ) {
            this.userVector       = userVector;
            this.adherenceWeights = adherenceWeights;
            this.useAdherence     = useAdherence;
            this.candidates       = candidates;
            this.constraints      = constraints;
            this.seenIds          = seenIds;
        }

        public String toJson() {
            try {
                return MAPPER.writeValueAsString(this);
            } catch (Exception e) {
                throw new RuntimeException("failed to serialize InferencePayload.Request", e);
            }
        }
    }

    // ── Candidate ─────────────────────────────────────────────────────────────

    public static class Candidate {
        @JsonProperty("id")                public final String       id;
        @JsonProperty("vector")            public final List<Double> vector;
        @JsonProperty("adherence_weights") public final List<Double> adherenceWeights;

        public Candidate(String id, List<Double> vector, List<Double> adherenceWeights) {
            this.id               = id;
            this.vector           = vector;
            this.adherenceWeights = adherenceWeights;
        }
    }

    // ── Constraint ────────────────────────────────────────────────────────────

    public static class Constraint {
        @JsonProperty("allele") public final int    allele;
        @JsonProperty("lower")  public final double lower;
        @JsonProperty("upper")  public final double upper;

        public Constraint(int allele, double lower, double upper) {
            this.allele = allele;
            this.lower  = lower;
            this.upper  = upper;
        }
    }

    // ── Response ──────────────────────────────────────────────────────────────

    public static class Response {
        @JsonProperty("results") public List<Result> results;

        public Response() {}

        public static Response fromJson(String json) {
            try {
                return MAPPER.readValue(json, Response.class);
            } catch (Exception e) {
                throw new RuntimeException("failed to deserialize InferencePayload.Response: " + json, e);
            }
        }
    }

    // ── Result ────────────────────────────────────────────────────────────────

    public static class Result {
        @JsonProperty("id")    public String id;
        @JsonProperty("score") public double score;

        public Result() {}
    }
}
