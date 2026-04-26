package com.system.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.system.bridge.InferencePayload;
import com.system.managers.SearchController;
import com.system.models.UserProfile;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RequestHandlerTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final HttpClient   CLIENT = HttpClient.newHttpClient();

    private SearchController controller;
    private RequestHandler   handler;
    private String           base;

    @BeforeEach
    void setUp() throws Exception {
        controller = Mockito.mock(SearchController.class);
        handler    = new RequestHandler(controller, 0);
        handler.start();
        base = "http://localhost:" + handler.getPort();
    }

    @AfterEach
    void tearDown() {
        handler.stop();
    }

    // ── /health ──────────────────────────────────────────────────────────────

    @Test
    void healthEndpoint_returns200WithOkBody() throws Exception {
        var resp = get(base + "/health");
        assertThat(resp.statusCode()).isEqualTo(200);
        assertThat(MAPPER.readTree(resp.body()).get("status").asText()).isEqualTo("ok");
    }

    // ── happy path ────────────────────────────────────────────────────────────

    @Test
    void searchEndpoint_validRequest_returns200WithResults() throws Exception {
        stubController("fig-1", 0.9);
        var resp = post(base + "/api/search", validBody());
        assertThat(resp.statusCode()).isEqualTo(200);
        assertThat(MAPPER.readTree(resp.body()).get("results").get(0).get("id").asText())
            .isEqualTo("fig-1");
    }

    // ── validation 400s ───────────────────────────────────────────────────────

    @Test
    void searchEndpoint_missingUserVector_returns400() throws Exception {
        ObjectNode body = MAPPER.createObjectNode();
        body.put("use_adherence", false);
        var resp = post(base + "/api/search", body);
        assertThat(resp.statusCode()).isEqualTo(400);
        assertThat(MAPPER.readTree(resp.body()).get("error").asText()).contains("user_vector");
    }

    @Test
    void searchEndpoint_userVectorWrongSize_returns400() throws Exception {
        ObjectNode body = MAPPER.createObjectNode();
        body.putPOJO("user_vector", new float[19]);
        body.put("use_adherence", false);
        var resp = post(base + "/api/search", body);
        assertThat(resp.statusCode()).isEqualTo(400);
        assertThat(MAPPER.readTree(resp.body()).get("error").asText()).contains("20");
    }

    @Test
    void searchEndpoint_userVectorOutOfRange_returns400() throws Exception {
        float[] vec = uniform(3f);
        vec[5] = 6f;
        ObjectNode body = MAPPER.createObjectNode();
        body.putPOJO("user_vector", vec);
        body.put("use_adherence", false);
        var resp = post(base + "/api/search", body);
        assertThat(resp.statusCode()).isEqualTo(400);
        assertThat(MAPPER.readTree(resp.body()).get("error").asText()).contains("1.0");
    }

    @Test
    void searchEndpoint_missingUseAdherence_returns400() throws Exception {
        ObjectNode body = MAPPER.createObjectNode();
        body.putPOJO("user_vector", uniform(3f));
        var resp = post(base + "/api/search", body);
        assertThat(resp.statusCode()).isEqualTo(400);
        assertThat(MAPPER.readTree(resp.body()).get("error").asText()).contains("use_adherence");
    }

    // ── optional fields ───────────────────────────────────────────────────────

    @Test
    void searchEndpoint_seenIdsOmitted_defaultsToEmpty() throws Exception {
        stubController("x", 0.5);
        var resp = post(base + "/api/search", validBody());
        assertThat(resp.statusCode()).isEqualTo(200);
        verify(controller).search(any(UserProfile.class), eq(false), eq(Collections.emptyList()));
    }

    // ── error cases ───────────────────────────────────────────────────────────

    @Test
    void searchEndpoint_controllerThrows_returns500() throws Exception {
        when(controller.search(any(), anyBoolean(), any())).thenThrow(new RuntimeException("boom"));
        var resp = post(base + "/api/search", validBody());
        assertThat(resp.statusCode()).isEqualTo(500);
        assertThat(MAPPER.readTree(resp.body()).get("error").asText()).isEqualTo("internal server error");
    }

    @Test
    void searchEndpoint_getMethod_returns405() throws Exception {
        var resp = get(base + "/api/search");
        assertThat(resp.statusCode()).isEqualTo(405);
    }

    @Test
    void unknownPath_returns404() throws Exception {
        var resp = get(base + "/unknown");
        assertThat(resp.statusCode()).isEqualTo(404);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static float[] uniform(float v) {
        float[] a = new float[20];
        Arrays.fill(a, v);
        return a;
    }

    private ObjectNode validBody() {
        ObjectNode body = MAPPER.createObjectNode();
        body.putPOJO("user_vector", uniform(3f));
        body.put("use_adherence", false);
        return body;
    }

    private void stubController(String id, double score) throws Exception {
        InferencePayload.Result r = new InferencePayload.Result();
        r.id    = id;
        r.score = score;
        InferencePayload.Response response = new InferencePayload.Response();
        response.results = new ArrayList<>(List.of(r));
        when(controller.search(any(), anyBoolean(), any())).thenReturn(response);
    }

    private HttpResponse<String> get(String url) throws Exception {
        return CLIENT.send(
            HttpRequest.newBuilder(URI.create(url)).GET().build(),
            HttpResponse.BodyHandlers.ofString()
        );
    }

    private HttpResponse<String> post(String url, Object body) throws Exception {
        return CLIENT.send(
            HttpRequest.newBuilder(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(MAPPER.writeValueAsString(body)))
                .build(),
            HttpResponse.BodyHandlers.ofString()
        );
    }
}
