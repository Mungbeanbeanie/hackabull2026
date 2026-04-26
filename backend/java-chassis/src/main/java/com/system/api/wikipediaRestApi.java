/*
 * Wikipedia public REST API wrapper — fetches politician image URLs only.
 * No auth required. Separate from wikimediaApi.java (Enterprise API, OAuth).
 */

package com.system.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class wikipediaRestApi {

    private static final String SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary/";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public wikipediaRestApi() {
        this.httpClient   = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Returns thumbnail URL for the politician's Wikipedia page, or null if unavailable
    public String fetchImageUrl(String pageTitle) {
        try {
            String encoded = URLEncoder.encode(pageTitle, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SUMMARY_BASE + encoded))
                .header("Accept", "application/json")
                .GET()
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) return null;

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode thumbnail = root.path("thumbnail");
            if (thumbnail.isMissingNode()) return null;

            JsonNode source = thumbnail.path("source");
            return source.isMissingNode() ? null : source.asText();

        } catch (Exception e) {
            return null;
        }
    }
}
