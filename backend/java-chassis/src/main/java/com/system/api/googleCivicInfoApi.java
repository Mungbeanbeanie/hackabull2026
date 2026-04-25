/*
 * Google Civic Information API wrapper — maps a user address to their current representatives.
 * Returns official names for the given location; used as input to district-based lookups.
 * Auth: API key passed as query parameter (no OAuth).
 */

package com.system.api;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class googleCivicInfoApi {

    private static final String BASE_URL =
        "https://www.googleapis.com/civicinfo/v2/representatives";

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public googleCivicInfoApi() {
        String key = System.getenv("GOOGLE_CIVIC_API_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("GOOGLE_CIVIC_API_KEY environment variable is not set");
        }
        this.apiKey = key;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Civic API → list of official names for the given address (used as district-scoped politician IDs)
    public List<String> fetchRepresentatives(String address) throws IOException {
        String encoded = URLEncoder.encode(address, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(buildUrl(encoded)))
            .header("Accept", "application/json")
            .GET()
            .build();

        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Google Civic API request interrupted for address=" + address, e);
        }

        if (response.statusCode() != 200) {
            throw new IOException("Google Civic API failed: HTTP " + response.statusCode()
                + " for address=" + address);
        }

        Map<String, Object> body = objectMapper.readValue(
            response.body(), new TypeReference<Map<String, Object>>() {});

        Object officials = body.get("officials");
        if (officials == null) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> officialList = (List<Map<String, Object>>) officials;

        return officialList.stream()
            .map(o -> (String) o.get("name"))
            .filter(name -> name != null && !name.isBlank())
            .collect(Collectors.toList());
    }

    private String buildUrl(String encodedAddress) {
        return BASE_URL + "?address=" + encodedAddress + "&key=" + apiKey;
    }
}
