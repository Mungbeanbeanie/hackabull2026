/*
    * The "Pipe."
    * It launches Python scripts and captures their output via System I/O
*/
package com.system.bridge;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class PythonRunner {

    private static final String PYTHON_CMD       = "python3";
    private static final String INFERENCE_SCRIPT = "backend/inference-engine/inference_manager.py";

    // General-purpose pipe: any script path, raw JSON in, raw JSON out
    public String run(String scriptPath, String jsonPayload) {
        ProcessBuilder pb = new ProcessBuilder(List.of(PYTHON_CMD, scriptPath));
        pb.redirectErrorStream(false);

        // Mirror selected JVM system properties into subprocess env.
        // EnvLoader puts .env keys into System properties, while Python SDKs read OS env vars.
        mapPropertyToEnv(pb, "GEMINI_API_KEY");
        mapPropertyToEnv(pb, "GOOGLE_API_KEY");
        mapPropertyToEnv(pb, "ELEVENLABS_API_KEY");

        Process process;
        try {
            process = pb.start();
        } catch (Exception e) {
            throw new RuntimeException("failed to launch " + scriptPath, e);
        }

        try (Writer stdin = new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8)) {
            stdin.write(jsonPayload);
        } catch (Exception e) {
            throw new RuntimeException("failed to write payload to " + scriptPath + " stdin", e);
        }

        StringBuilder stdout = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) stdout.append(line);
        } catch (Exception e) {
            throw new RuntimeException("failed to read " + scriptPath + " stdout", e);
        }

        StringBuilder stderr = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) stderr.append(line).append('\n');
        } catch (Exception ignored) {}

        int exitCode;
        try {
            exitCode = process.waitFor();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("interrupted while waiting for " + scriptPath, e);
        }

        if (exitCode != 0) {
            throw new RuntimeException(scriptPath + " exited " + exitCode + ": " + stderr.toString().trim());
        }

        return stdout.toString();
    }

    // Typed convenience wrapper for inference_manager.py
    public InferencePayload.Response run(InferencePayload.Request payload) {
        return InferencePayload.Response.fromJson(run(INFERENCE_SCRIPT, payload.toJson()));
    }

    private static void mapPropertyToEnv(ProcessBuilder pb, String key) {
        String value = System.getProperty(key);
        if (value != null && !value.isBlank()) {
            pb.environment().put(key, value);
        }
    }


}
