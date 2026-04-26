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
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RequestHandler {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final SearchController controller;
    private final HttpServer        server;

    public RequestHandler(SearchController controller, int port) throws IOException {
        this.controller = controller;
        this.server     = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/search", this::handleSearch);
        server.createContext("/health",     this::handleHealth);
        server.createContext("/",           ex -> respond(ex, 404, jsonError("not found")));
    }

    public void start()  { server.start(); }
    public void stop()   { server.stop(0); }
    public int getPort() { return server.getAddress().getPort(); }

    // ── route handlers ────────────────────────────────────────────────────────

    private void handleHealth(HttpExchange ex) throws IOException {
        respond(ex, 200, "{\"status\":\"ok\"}");
    }

    private void handleSearch(HttpExchange ex) throws IOException {
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

    // ── utilities ─────────────────────────────────────────────────────────────

    private static void respond(HttpExchange ex, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String jsonError(String message) {
        return "{\"error\":\"" + message + "\"}";
    }
}
