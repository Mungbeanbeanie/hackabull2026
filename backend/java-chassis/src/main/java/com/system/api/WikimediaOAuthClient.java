/*
 * Manages Wikimedia Enterprise API authentication.
 * Logs in with username/password, caches the access token, and refreshes via
 * refresh token before expiry. Falls back to full re-login if refresh fails.
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

    private static final String LOGIN_URL = "https://auth.enterprise.wikimedia.com/v1/login";
    private static final String REFRESH_URL = "https://auth.enterprise.wikimedia.com/v1/token-refresh";
    private static final long EXPIRY_BUFFER_SECONDS = 60;

    private final String username;
    private final String password;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private String accessToken;
    private String refreshToken;
    private Instant tokenExpiresAt = Instant.EPOCH;

    public WikimediaOAuthClient() {
        this.username = Objects.requireNonNull(
            System.getenv("WIKIMEDIA_USERNAME"), "WIKIMEDIA_USERNAME must be set");
        this.password = Objects.requireNonNull(
            System.getenv("WIKIMEDIA_PASSWORD"), "WIKIMEDIA_PASSWORD must be set");
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Returns a valid access token, refreshing or re-logging in as needed
    public synchronized String getToken() throws IOException, InterruptedException {
        if (accessToken == null) {
            login();
        } else if (!isTokenValid()) {
            refreshAccessToken();
        }
        return accessToken;
    }

    // Unconditionally refreshes the access token; call when upstream returns 401
    public synchronized String forceRefresh() throws IOException, InterruptedException {
        refreshAccessToken();
        return accessToken;
    }

    private boolean isTokenValid() {
        return Instant.now().plusSeconds(EXPIRY_BUFFER_SECONDS).isBefore(tokenExpiresAt);
    }

    private void login() throws IOException, InterruptedException {
        String body = objectMapper.writeValueAsString(
            new java.util.HashMap<>() {{
                put("username", username);
                put("password", password);
            }}
        );

        JsonNode json = postJson(LOGIN_URL, body);
        storeTokens(json);
    }

    private void refreshAccessToken() throws IOException, InterruptedException {
        try {
            String body = objectMapper.writeValueAsString(
                new java.util.HashMap<>() {{
                    put("refresh_token", refreshToken);
                }}
            );
            JsonNode json = postJson(REFRESH_URL, body);
            storeTokens(json);
        } catch (IOException e) {
            // Refresh token expired or invalid — fall back to full re-login
            login();
        }
    }

    private void storeTokens(JsonNode json) {
        accessToken = json.get("access_token").asText();
        // Refresh token is only issued on full login; preserve existing one on refresh responses
        if (json.has("refresh_token")) {
            refreshToken = json.get("refresh_token").asText();
        }
        long expiresIn = json.has("expires_in") ? json.get("expires_in").asLong() : 3600L;
        tokenExpiresAt = Instant.now().plusSeconds(expiresIn);
    }

    private JsonNode postJson(String url, String body) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(body))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("Auth request to " + url + " failed: HTTP "
                + response.statusCode() + " — " + response.body());
        }

        return objectMapper.readTree(response.body());
    }
}
