/*
 * Congress.gov API v3 wrapper — fetches federal voting records for a member.
 * Used exclusively for Adherence Scalar computation; not a source for PoliVector generation.
 * Input IDs are bioguideIds (federal-only, e.g. "R000595") — not OpenStates person IDs.
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
import java.util.Map;

public class congressGovApi {

    private static final String BASE_URL = "https://api.congress.gov/v3";
    private static final int VOTES_PAGE_LIMIT = 250;
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000L;

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public congressGovApi() {
        String key = System.getenv("CONGRESS_GOV_API_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("CONGRESS_GOV_API_KEY environment variable is not set");
        }
        this.apiKey = key;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Congress.gov → member profile + voting history; feeds weight_calculator.py for Adherence Scalar
    public Map<String, Object> fetchVotingRecord(String bioguideId) throws IOException {
        Map<String, Object> member = fetchMember(bioguideId);
        Map<String, Object> votesPayload = fetchVotes(bioguideId);

        @SuppressWarnings("unchecked")
        Object votes = votesPayload.get("votes");
        Object pagination = votesPayload.get("pagination");

        return Map.of(
            "member",     member,
            "votes",      votes      != null ? votes      : java.util.Collections.emptyList(),
            "pagination", pagination != null ? pagination : Map.of()
        );
    }

    private Map<String, Object> fetchMember(String bioguideId) throws IOException {
        HttpRequest request = buildRequest(BASE_URL + "/member/" + bioguideId);
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() != 200) {
            throw new IOException("Congress.gov /member request failed: HTTP " + response.statusCode()
                + " for bioguideId=" + bioguideId);
        }

        Map<String, Object> body = objectMapper.readValue(
            response.body(), new TypeReference<Map<String, Object>>() {});

        Object member = body.get("member");
        if (member == null) {
            throw new IOException(
                "Unexpected Congress.gov member response shape for bioguideId=" + bioguideId);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> memberMap = (Map<String, Object>) member;
        return memberMap;
    }

    private Map<String, Object> fetchVotes(String bioguideId) throws IOException {
        String url = BASE_URL + "/member/" + bioguideId + "/votes?limit=" + VOTES_PAGE_LIMIT;
        HttpRequest request = buildRequest(url);
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() != 200) {
            throw new IOException("Congress.gov /votes request failed: HTTP " + response.statusCode()
                + " for bioguideId=" + bioguideId);
        }

        return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
    }

    private HttpResponse<String> sendWithRetry(HttpRequest request) throws IOException {
        IOException lastException = null;

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            HttpResponse<String> response;
            try {
                response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("Congress.gov request interrupted: " + request.uri(), e);
            }

            if (response.statusCode() != 429) {
                return response;
            }

            lastException = new IOException("Congress.gov rate limited (429): " + request.uri());

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
            .header("X-Api-Key", apiKey)
            .header("Accept", "application/json")
            .GET()
            .build();
    }
}
