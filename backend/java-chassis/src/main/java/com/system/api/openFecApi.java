/*
 * OpenFEC API v1 wrapper — fetches donor and PAC connections for a candidate.
 * Feeds the Edge Map directly; no LLM tagging involved.
 * Auth via api_key query param (not a header — OpenFEC convention).
 * Input IDs are FEC candidate_ids (e.g. "H8CA20177") — not bioguideIds or OpenStates IDs.
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

public class openFecApi {

    private static final String BASE_URL = "https://api.open.fec.gov/v1";
    private static final int PAGE_LIMIT = 20;
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000L;

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public openFecApi() {
        String key = System.getenv("OPEN_FEC_API_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("OPEN_FEC_API_KEY environment variable is not set");
        }
        this.apiKey = key;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // OpenFEC → candidate profile + associated PACs + top donors by amount; feeds Edge Map nodes and weights
    public Map<String, Object> fetchDonorConnections(String candidateId) throws IOException {
        Map<String, Object> candidate = fetchCandidate(candidateId);

        List<Object> committees = fetchPagedResults(
            "/candidate/" + candidateId + "/committees/?per_page=" + PAGE_LIMIT);

        List<Object> topDonors = fetchPagedResults(
            "/schedules/schedule_a/?candidate_id=" + candidateId
            + "&sort=-contribution_receipt_amount"
            + "&per_page=" + PAGE_LIMIT);

        return Map.of(
            "candidate",  candidate,
            "committees", committees,
            "topDonors",  topDonors
        );
    }

    private Map<String, Object> fetchCandidate(String candidateId) throws IOException {
        HttpRequest request = buildRequest(withKey(BASE_URL + "/candidate/" + candidateId + "/"));
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() != 200) {
            throw new IOException("OpenFEC /candidate request failed: HTTP " + response.statusCode()
                + " for candidateId=" + candidateId);
        }

        Map<String, Object> body = objectMapper.readValue(
            response.body(), new TypeReference<Map<String, Object>>() {});

        @SuppressWarnings("unchecked")
        List<Object> results = (List<Object>) body.get("results");
        if (results == null || results.isEmpty()) {
            throw new IOException("No FEC candidate found for id=" + candidateId);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> candidateMap = (Map<String, Object>) results.get(0);
        return candidateMap;
    }

    private List<Object> fetchPagedResults(String path) throws IOException {
        HttpRequest request = buildRequest(withKey(BASE_URL + path));
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() != 200) {
            throw new IOException("OpenFEC request failed: HTTP " + response.statusCode()
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
                throw new IOException("OpenFEC request interrupted: " + request.uri(), e);
            }

            if (response.statusCode() != 429) {
                return response;
            }

            lastException = new IOException("OpenFEC rate limited (429): " + request.uri());

            if (attempt < MAX_RETRIES - 1) {
                try {
                    Thread.sleep(RETRY_DELAY_MS * (attempt + 1));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IOException("Retry sleep interrupted", e);
                }
            }
        }

        throw new IOException(
            "Rate limited after " + MAX_RETRIES + " retries: " + request.uri(), lastException);
    }

    private HttpRequest buildRequest(String url) {
        return HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Accept", "application/json")
            .GET()
            .build();
    }

    private String withKey(String url) {
        return url.contains("?") ? url + "&api_key=" + apiKey : url + "?api_key=" + apiKey;
    }
}
