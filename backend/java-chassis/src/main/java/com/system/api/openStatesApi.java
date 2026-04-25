/*
 * OpenStates API v3 wrapper — fetches legislative data for a politician.
 * Aggregates profile, sponsored bills, and vote records into a single payload
 * consumed by prompt_builder.py for LLM-based PoliVector generation.
 * Handles 429 rate limiting with linear backoff retry.
 */

package com.system.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class openStatesApi {

    private static final String BASE_URL = "https://v3.openstates.org";
    private static final int BILLS_PAGE_LIMIT = 20;
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000L;

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public openStatesApi() {
        String key = System.getenv("OPEN_STATES_API_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("OPEN_STATES_API_KEY environment variable is not set");
        }
        this.apiKey = key;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Aggregates profile + sponsored bills + vote records; sole input for PoliVector generation via LLM
    public Map<String, Object> fetchLegislativeData(String politicianId) throws IOException {
        Map<String, Object> profile = fetchProfile(politicianId);

        List<Object> sponsoredBills = fetchPagedResults(
            "/bills?sponsor_id=" + politicianId
            + "&per_page=" + BILLS_PAGE_LIMIT
            + "&sort=updated_at"
        );

        // vote records endpoint is best-effort — 404 returns empty list
        List<Object> voteRecords = fetchPagedResults(
            "/bills?people_votes_id=" + politicianId
            + "&include=votes"
            + "&per_page=" + BILLS_PAGE_LIMIT
        );

        return Map.of(
            "profile",        profile,
            "sponsoredBills", sponsoredBills,
            "voteRecords",    voteRecords
        );
    }

    private Map<String, Object> fetchProfile(String politicianId) throws IOException {
        HttpRequest request = buildRequest(BASE_URL + "/people/" + politicianId);
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() != 200) {
            throw new IOException("OpenStates /people request failed: HTTP " + response.statusCode()
                + " for id=" + politicianId);
        }

        return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
    }

    private List<Object> fetchPagedResults(String path) throws IOException {
        HttpRequest request = buildRequest(BASE_URL + path);
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() == 404) {
            return Collections.emptyList();
        }

        if (response.statusCode() != 200) {
            throw new IOException("OpenStates request failed: HTTP " + response.statusCode()
                + " for path=" + path);
        }

        Map<String, Object> body = objectMapper.readValue(
            response.body(), new TypeReference<Map<String, Object>>() {});

        Object results = body.get("results");
        if (results == null) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        List<Object> resultList = (List<Object>) results;
        return resultList;
    }

    private HttpResponse<String> sendWithRetry(HttpRequest request) throws IOException {
        IOException lastException = null;

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            HttpResponse<String> response;
            try {
                response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("OpenStates request interrupted: " + request.uri(), e);
            }

            if (response.statusCode() != 429) {
                return response;
            }

            lastException = new IOException("OpenStates rate limited (429): " + request.uri());

            if (attempt < MAX_RETRIES - 1) {
                try {
                    Thread.sleep(RETRY_DELAY_MS * (attempt + 1));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IOException("Retry sleep interrupted", e);
                }
            }
        }

        throw new IOException("Rate limited after " + MAX_RETRIES + " retries: " + request.uri(),
            lastException);
    }

    private HttpRequest buildRequest(String url) {
        return HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("X-API-KEY", apiKey)
            .header("Accept", "application/json")
            .GET()
            .build();
    }
}
