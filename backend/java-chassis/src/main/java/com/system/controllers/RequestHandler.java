/*
 * HTTP entry point — receives search/recommendation requests from the frontend
 * Validates inbound request, then delegates to SearchController
 * Single inbound gateway; no business logic lives here
 */

package com.system.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import com.system.bridge.InferencePayload;
import com.system.managers.SearchController;
import com.system.models.UserProfile;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RequestHandler {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    private final SearchController controller;
    private final HttpServer        server;

    public RequestHandler(SearchController controller, int port) throws IOException {
        this.controller = controller;
        this.server     = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/search",      this::handleSearch);
        server.createContext("/api/politicians", this::handlePoliticians);
        server.createContext("/api/simulation/transcript", this::handleSimulationTranscript);
        server.createContext("/api/simulation/tts", this::handleSimulationTts);
        server.createContext("/health",          this::handleHealth);
        server.createContext("/",                ex -> respond(ex, 404, jsonError("not found")));
    }

    public void start()  { server.start(); }
    public void stop()   { server.stop(0); }
    public int getPort() { return server.getAddress().getPort(); }

    // ── route handlers ────────────────────────────────────────────────────────

    private void handleHealth(HttpExchange ex) throws IOException {
        if (handlePreflight(ex)) return;

        boolean geminiConfigured = hasConfig("GEMINI_API_KEY") || hasConfig("GOOGLE_API_KEY");
        boolean elevenConfigured = hasConfig("ELEVENLABS_API_KEY");

        String body = MAPPER.writeValueAsString(Map.of(
            "status", "ok",
            "geminiConfigured", geminiConfigured,
            "elevenlabsConfigured", elevenConfigured
        ));
        respond(ex, 200, body);
    }

    private void handlePoliticians(HttpExchange ex) throws IOException {
        if (handlePreflight(ex)) return;
        if (!"GET".equals(ex.getRequestMethod())) {
            respond(ex, 405, jsonError("method not allowed"));
            return;
        }
        try {
            String body = MAPPER.writeValueAsString(Map.of("politicians", controller.getAllFigures()));
            respond(ex, 200, body);
        } catch (Exception e) {
            respond(ex, 500, jsonError("internal server error"));
        }
    }

    private void handleSearch(HttpExchange ex) throws IOException {
        if (handlePreflight(ex)) return;
        if (!"POST".equals(ex.getRequestMethod())) {
            respond(ex, 405, jsonError("method not allowed"));
            return;
        }

        JsonNode root;
        try {
            byte[] bytes = ex.getRequestBody().readAllBytes();
            root = MAPPER.readTree(bytes);
        } catch (Exception e) {
            respond(ex, 400, jsonError("invalid JSON"));
            return;
        }

        // validate user_vector
        JsonNode uvNode = root.get("user_vector");
        if (uvNode == null || !uvNode.isArray()) {
            respond(ex, 400, jsonError("user_vector is required"));
            return;
        }
        if (uvNode.size() != 20) {
            respond(ex, 400, jsonError("user_vector must have 20 dimensions"));
            return;
        }
        float[] userVector = new float[20];
        for (int i = 0; i < 20; i++) {
            float v = (float) uvNode.get(i).asDouble();
            if (v < 1.0f || v > 5.0f) {
                respond(ex, 400, jsonError("user_vector values must be in [1.0, 5.0]"));
                return;
            }
            userVector[i] = v;
        }

        // validate use_adherence
        JsonNode uaNode = root.get("use_adherence");
        if (uaNode == null || !uaNode.isBoolean()) {
            respond(ex, 400, jsonError("use_adherence is required"));
            return;
        }
        boolean useAdherence = uaNode.asBoolean();

        // optional weights — default to uniform
        float[] weights = new float[20];
        Arrays.fill(weights, 1.0f);
        JsonNode wNode = root.get("weights");
        if (wNode != null && wNode.isArray() && wNode.size() == 20) {
            for (int i = 0; i < 20; i++) weights[i] = (float) wNode.get(i).asDouble();
        }

        // optional seen_ids — default empty
        List<String> seenIds = new ArrayList<>();
        JsonNode siNode = root.get("seen_ids");
        if (siNode != null && siNode.isArray()) {
            for (JsonNode n : siNode) seenIds.add(n.asText());
        }

        UserProfile profile = new UserProfile(userVector, weights);

        InferencePayload.Response result;
        try {
            result = controller.search(profile, useAdherence, seenIds);
        } catch (Exception e) {
            respond(ex, 500, jsonError("internal server error"));
            return;
        }

        try {
            respond(ex, 200, MAPPER.writeValueAsString(result));
        } catch (Exception e) {
            respond(ex, 500, jsonError("internal server error"));
        }
    }

    private void handleSimulationTranscript(HttpExchange ex) throws IOException {
        if (handlePreflight(ex)) return;
        if (!"POST".equals(ex.getRequestMethod())) {
            respond(ex, 405, jsonError("method not allowed"));
            return;
        }

        JsonNode root;
        try {
            root = MAPPER.readTree(ex.getRequestBody().readAllBytes());
        } catch (Exception e) {
            respond(ex, 400, jsonError("invalid JSON"));
            return;
        }

        JsonNode participantsNode = root.get("participants");
        JsonNode topicNode = root.get("topic");
        String mode = root.path("mode").asText("theoretical");
        JsonNode userProfileNode = root.get("userProfile");

        if (participantsNode == null || !participantsNode.isArray() || participantsNode.isEmpty()) {
            respond(ex, 400, jsonError("participants is required"));
            return;
        }
        if (topicNode == null || !topicNode.isObject()) {
            respond(ex, 400, jsonError("topic is required"));
            return;
        }

        try {
            JsonNode result;
            if (hasConfig("GEMINI_API_KEY") || hasConfig("GOOGLE_API_KEY")) {
                result = buildGeminiTranscript(participantsNode, topicNode, mode, userProfileNode);
            } else {
                result = buildFallbackTranscript(participantsNode, topicNode, mode);
            }
            respond(ex, 200, MAPPER.writeValueAsString(result));
        } catch (Exception e) {
            try {
                JsonNode fallback = buildFallbackTranscript(participantsNode, topicNode, mode);
                respond(ex, 200, MAPPER.writeValueAsString(fallback));
            } catch (Exception ignored) {
                respond(ex, 500, jsonError("failed to generate transcript"));
            }
        }
    }

    private void handleSimulationTts(HttpExchange ex) throws IOException {
        if (handlePreflight(ex)) return;
        if (!"POST".equals(ex.getRequestMethod())) {
            respond(ex, 405, jsonError("method not allowed"));
            return;
        }

        JsonNode root;
        try {
            root = MAPPER.readTree(ex.getRequestBody().readAllBytes());
        } catch (Exception e) {
            respond(ex, 400, jsonError("invalid JSON"));
            return;
        }

        String text = root.path("text").asText("");
        String voiceName = root.path("voiceName").asText("Antoni");
        if (text.isBlank()) {
            respond(ex, 400, jsonError("text is required"));
            return;
        }
        if (!hasConfig("ELEVENLABS_API_KEY")) {
            respond(ex, 503, jsonError("elevenlabs not configured"));
            return;
        }

        try {
            String voiceId = resolveElevenVoiceId(voiceName);
            String apiKey = System.getProperty("ELEVENLABS_API_KEY");
            if (apiKey == null || apiKey.isBlank()) apiKey = System.getenv("ELEVENLABS_API_KEY");
            if (apiKey == null || apiKey.isBlank()) {
                respond(ex, 503, jsonError("elevenlabs not configured"));
                return;
            }

            String body = MAPPER.writeValueAsString(Map.of(
                "text", text,
                "model_id", "eleven_multilingual_v2",
                "voice_settings", Map.of("stability", 0.45, "similarity_boost", 0.75)
            ));

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId))
                .header("Content-Type", "application/json")
                .header("xi-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

            HttpResponse<byte[]> tts = HTTP.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (tts.statusCode() < 200 || tts.statusCode() >= 300) {
                respond(ex, 502, jsonError("elevenlabs request failed"));
                return;
            }

            String b64 = Base64.getEncoder().encodeToString(tts.body());
            respond(ex, 200, MAPPER.writeValueAsString(Map.of("audioBase64", b64, "mimeType", "audio/mpeg")));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            respond(ex, 500, jsonError("tts generation interrupted"));
        } catch (Exception e) {
            respond(ex, 500, jsonError("tts generation failed"));
        }
    }

    // ── utilities ─────────────────────────────────────────────────────────────

    private JsonNode buildGeminiTranscript(JsonNode participants, JsonNode topic, String mode, JsonNode userProfile) throws Exception {
        String apiKey = System.getProperty("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) apiKey = System.getProperty("GOOGLE_API_KEY");
        if (apiKey == null || apiKey.isBlank()) apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) apiKey = System.getenv("GOOGLE_API_KEY");

        int turnCount = Math.max(8, participants.size() * 3);
        String prompt = "Generate a political debate transcript in strict JSON only (no markdown, no prose outside JSON)." +
            " Return an object with key turns: [{speakerId, text, triggeredAlleles}]." +
            " Generate exactly " + turnCount + " turns." +
            " Each turn text should be natural spoken dialogue (2-5 sentences), grounded in the provided vectors and topic." +
            " Do not truncate or artificially cap character counts." +
            " Use only speakerId values from provided participants." +
            " triggeredAlleles must be 1-2 entries from topic.alleles." +
            " topic=" + MAPPER.writeValueAsString(topic) +
            " mode=" + mode +
            " participants=" + MAPPER.writeValueAsString(participants) +
            " userProfile=" + (userProfile == null ? "null" : MAPPER.writeValueAsString(userProfile));

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        payload.put("generationConfig", Map.of(
            "responseMimeType", "application/json",
            "temperature", 0.35,
            "maxOutputTokens", 1400
        ));

        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(MAPPER.writeValueAsString(payload), StandardCharsets.UTF_8))
            .build();

        HttpResponse<String> gemini = HTTP.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        if (gemini.statusCode() < 200 || gemini.statusCode() >= 300) {
            throw new IOException("gemini request failed");
        }

        JsonNode root = MAPPER.readTree(gemini.body());
        String text = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");
        if (text.isBlank()) throw new IOException("gemini empty output");

        JsonNode parsed = MAPPER.readTree(text);
        JsonNode turns = parsed.path("turns");
        if (!turns.isArray() || turns.isEmpty()) throw new IOException("invalid transcript");
        return parsed;
    }

    private JsonNode buildFallbackTranscript(JsonNode participants, JsonNode topic, String mode) {
        List<Map<String, Object>> turns = new ArrayList<>();
        JsonNode alleles = topic.path("alleles");
        int turnCount = Math.max(8, participants.size() * 3);
        for (int i = 0; i < turnCount; i++) {
            JsonNode speaker = participants.get(i % participants.size());
            String speakerId = speaker.path("id").asText("unknown");
            String name = speaker.path("name").asText("Speaker");
            String topicLabel = topic.path("label").asText("Policy");
            String modePhrase = "theoretical".equals(mode)
                ? "campaign commitments"
                : "legislative behavior";
            String line = "On " + topicLabel + ", " + name + " argues for a pragmatic stance tied to " + modePhrase + ".";
            List<String> triggered = new ArrayList<>();
            if (alleles.isArray() && !alleles.isEmpty()) {
                triggered.add(alleles.get(i % alleles.size()).asText());
                if (alleles.size() > 1) triggered.add(alleles.get((i + 1) % alleles.size()).asText());
            }
            turns.add(Map.of(
                "speakerId", speakerId,
                "text", line,
                "triggeredAlleles", triggered
            ));
        }
        return MAPPER.valueToTree(Map.of("turns", turns));
    }

    private String resolveElevenVoiceId(String voiceName) {
        String key = "ELEVENLABS_VOICE_" + voiceName.toUpperCase().replaceAll("[^A-Z0-9]", "_");
        String configured = System.getProperty(key);
        if (configured == null || configured.isBlank()) configured = System.getenv(key);
        if (configured != null && !configured.isBlank()) return configured;

        return switch (voiceName) {
            case "Bella", "Gigi" -> "EXAVITQu4vr4xnSDxMaL";
            case "Bill" -> "VR6AewLTigWG4xSOukaG";
            default -> "ErXwobaYiN019PkySvjV";
        };
    }

    private static void setCorsHeaders(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin",  "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        ex.getResponseHeaders().set("Access-Control-Max-Age",       "86400");
    }

    private static boolean handlePreflight(HttpExchange ex) throws IOException {
        if (!"OPTIONS".equals(ex.getRequestMethod())) return false;
        setCorsHeaders(ex);
        ex.sendResponseHeaders(204, -1);
        ex.close();
        return true;
    }

    private static void respond(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        setCorsHeaders(ex);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String jsonError(String message) {
        return "{\"error\":\"" + message + "\"}";
    }

    private static boolean hasConfig(String key) {
        String value = System.getProperty(key);
        if (value == null || value.isBlank()) {
            value = System.getenv(key);
        }
        return value != null && !value.isBlank();
    }
}
