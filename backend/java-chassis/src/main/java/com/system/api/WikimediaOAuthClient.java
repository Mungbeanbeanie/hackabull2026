/*
 * Manages the Wikimedia OAuth 2.0 client-credentials token lifecycle.
 * Caches the active token and auto-refreshes before expiry or on upstream 401.
 */

package com.system.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.util.Objects;

public class WikimediaOAuthClient {

    private static final String TOKEN_URL = "https://meta.wikimedia.org/w/rest.php/oauth2/access_token";
    private static final long EXPIRY_BUFFER_SECONDS = 60;

    private final String clientId;
    private final String clientSecret;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private String cachedToken;
    private Instant tokenExpiresAt = Instant.EPOCH;

    public WikimediaOAuthClient() {
        this.clientId = Objects.requireNonNull(
            System.getenv("WIKIMEDIA_CLIENT_ID"), "WIKIMEDIA_CLIENT_ID must be set");
        this.clientSecret = Objects.requireNonNull(
            System.getenv("WIKIMEDIA_CLIENT_SECRET"), "WIKIMEDIA_CLIENT_SECRET must be set");
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Returns a valid token, fetching a new one if the cached token is expired or near expiry
    public synchronized String getToken() throws IOException, InterruptedException {
        if (isTokenValid()) {
            return cachedToken;
        }
        return fetchNewToken();
    }

    // Unconditionally fetches a new token; call when upstream returns 401
    public synchronized String forceRefresh() throws IOException, InterruptedException {
        return fetchNewToken();
    }

    private boolean isTokenValid() {
        return cachedToken != null
            && Instant.now().plusSeconds(EXPIRY_BUFFER_SECONDS).isBefore(tokenExpiresAt);
    }

    private String fetchNewToken() throws IOException, InterruptedException {
        String formBody = "grant_type=client_credentials"
            + "&client_id=" + clientId
            + "&client_secret=" + clientSecret;

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(TOKEN_URL))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(formBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("OAuth token fetch failed: HTTP " + response.statusCode()
                + " — " + response.body());
        }

        JsonNode json = objectMapper.readTree(response.body());
        cachedToken = json.get("access_token").asText();
        long expiresIn = json.get("expires_in").asLong();
        tokenExpiresAt = Instant.now().plusSeconds(expiresIn);

        return cachedToken;
    }
}
