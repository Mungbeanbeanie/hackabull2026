/*
 * LegiScan API wrapper — fetches raw bill texts and granular roll-call voting records.
 * Supplements OpenStates with deep policy text and state-level vote data.
 * Single-endpoint, operation-based: all calls route through one URL with op= param.
 * Auth via key query param (no header). Retries on 429 and transient 5xx errors.
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class legiscanApi {

    private static final String BASE_URL = "https://api.legiscan.com/";
    private static final int MAX_RETRIES = 3;
    private static final long RETRY_DELAY_MS = 1000L;

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public legiscanApi() {
        String key = System.getenv("LEGISCAN_API_KEY");
        if (key == null || key.isBlank()) {
            throw new IllegalStateException("LEGISCAN_API_KEY environment variable is not set");
        }
        this.apiKey = key;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    // Full bill details including sponsors, vote summary, and base64-encoded text links
    public Map<String, Object> fetchBill(int billId) throws IOException {
        Map<String, Object> response = callApi("getBill", Map.of("id", String.valueOf(billId)));
        checkStatus(response, "getBill id=" + billId);

        @SuppressWarnings("unchecked")
        Map<String, Object> bill = (Map<String, Object>) response.get("bill");
        if (bill == null) {
            throw new IOException("LegiScan getBill returned no bill object for id=" + billId);
        }
        return bill;
    }

    // Granular roll-call record: individual member votes (Yea/Nay/Absent) for a single vote event
    public Map<String, Object> fetchRollCall(int rollCallId) throws IOException {
        Map<String, Object> response = callApi("getRollCall", Map.of("id", String.valueOf(rollCallId)));
        checkStatus(response, "getRollCall id=" + rollCallId);

        @SuppressWarnings("unchecked")
        Map<String, Object> rollCall = (Map<String, Object>) response.get("roll_call");
        if (rollCall == null) {
            throw new IOException(
                "LegiScan getRollCall returned no roll_call object for id=" + rollCallId);
        }
        return rollCall;
    }

    // Legislator profile by LegiScan person ID (distinct from OpenStates and bioguideId)
    public Map<String, Object> fetchPerson(int personId) throws IOException {
        Map<String, Object> response = callApi("getPerson", Map.of("id", String.valueOf(personId)));
        checkStatus(response, "getPerson id=" + personId);

        @SuppressWarnings("unchecked")
        Map<String, Object> person = (Map<String, Object>) response.get("person");
        if (person == null) {
            throw new IOException(
                "LegiScan getPerson returned no person object for id=" + personId);
        }
        return person;
    }

    // Full-text bill search for a state; results normalized from object-keyed map to list
    public List<Object> searchBills(String query, String state) throws IOException {
        Map<String, Object> response = callApi(
            "getSearch", Map.of("query", query, "state", state));
        checkStatus(response, "getSearch query=" + query + " state=" + state);

        Object searchResult = response.get("searchresult");
        if (searchResult == null) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> searchResultMap = (Map<String, Object>) searchResult;
        Object results = searchResultMap.get("results");
        if (results == null) {
            return Collections.emptyList();
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> resultsMap = (Map<String, Object>) results;
        return normalizeSearchResults(resultsMap);
    }

    private Map<String, Object> callApi(String op, Map<String, String> params) throws IOException {
        String url = buildUrl(op, params);
        HttpRequest request = buildRequest(url);
        HttpResponse<String> response = sendWithRetry(request);

        if (response.statusCode() != 200) {
            throw new IOException("LegiScan request failed: HTTP " + response.statusCode()
                + " op=" + op);
        }

        return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
    }

    private String buildUrl(String op, Map<String, String> params) {
        StringBuilder sb = new StringBuilder(BASE_URL)
            .append("?key=").append(apiKey)
            .append("&op=").append(op);
        for (Map.Entry<String, String> entry : params.entrySet()) {
            sb.append("&").append(entry.getKey()).append("=")
              .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    private void checkStatus(Map<String, Object> response, String context) throws IOException {
        if (!"OK".equals(response.get("status"))) {
            String alertMsg = "unknown error";
            Object alert = response.get("alert");
            if (alert instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> alertMap = (Map<String, Object>) alert;
                Object msg = alertMap.get("message");
                if (msg != null) {
                    alertMsg = msg.toString();
                }
            }
            throw new IOException("LegiScan ERROR [" + context + "]: " + alertMsg);
        }
    }

    private List<Object> normalizeSearchResults(Map<String, Object> resultsMap) {
        List<Object> list = new ArrayList<>();
        for (Map.Entry<String, Object> entry : resultsMap.entrySet()) {
            // skip non-map entries (e.g. summary keys that leak into the results object)
            if (entry.getValue() instanceof Map) {
                list.add(entry.getValue());
            }
        }
        return list;
    }

    private HttpResponse<String> sendWithRetry(HttpRequest request) throws IOException {
        IOException lastException = null;

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            HttpResponse<String> response;
            try {
                response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IOException("LegiScan request interrupted: " + request.uri(), e);
            }

            int status = response.statusCode();
            boolean shouldRetry = status == 429 || status == 502 || status == 503 || status == 504;
            if (!shouldRetry) {
                return response;
            }

            lastException = new IOException(
                "LegiScan transient error (HTTP " + status + "): " + request.uri());

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
            "LegiScan failed after " + MAX_RETRIES + " retries: " + request.uri(), lastException);
    }

    private HttpRequest buildRequest(String url) {
        return HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Accept", "application/json")
            .GET()
            .build();
    }
}
