/*
 * Wikimedia API wrapper — fetches politician biography summaries from Wikipedia.
 * Delegates all OAuth token management to WikimediaOAuthClient.
 * On 401, triggers a token refresh and retries the request once.
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
import java.util.Map;

public class wikimediaApi {

    private static final String SUMMARY_BASE_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

    private final WikimediaOAuthClient oauthClient;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public wikimediaApi(WikimediaOAuthClient oauthClient) {
        this.oauthClient = oauthClient;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Wikipedia REST API → biography summary for a politician; enriches PoliFigure metadata
    public Map<String, Object> fetchPoliticianSummary(String pageTitle)
            throws IOException, InterruptedException {
        String encoded = URLEncoder.encode(pageTitle, StandardCharsets.UTF_8);
        String token = oauthClient.getToken();

        HttpResponse<String> response = sendRequest(encoded, token);

        if (response.statusCode() == 401) {
            // Cached token was rejected — refresh and retry once
            token = oauthClient.forceRefresh();
            response = sendRequest(encoded, token);
        }

        if (response.statusCode() != 200) {
            throw new IOException("Wikimedia summary request failed: HTTP " + response.statusCode()
                + " for title=" + pageTitle);
        }

        return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
    }

    private HttpResponse<String> sendRequest(String encodedTitle, String token)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(SUMMARY_BASE_URL + encodedTitle))
            .header("Authorization", "Bearer " + token)
            .header("Accept", "application/json")
            .GET()
            .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
