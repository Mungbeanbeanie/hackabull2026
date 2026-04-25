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

    public static InferencePayload.Response run(InferencePayload.Request payload) {
        String json = payload.toJson();

        ProcessBuilder pb = new ProcessBuilder(List.of(PYTHON_CMD, INFERENCE_SCRIPT));
        pb.redirectErrorStream(false);

        Process process;
        try {
            process = pb.start();
        } catch (Exception e) {
            throw new RuntimeException("failed to launch inference_manager.py", e);
        }

        // write payload JSON to Python stdin
        try (Writer stdin = new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8)) {
            stdin.write(json);
        } catch (Exception e) {
            throw new RuntimeException("failed to write payload to inference_manager stdin", e);
        }

        // read stdout into a string
        StringBuilder stdout = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                stdout.append(line);
            }
        } catch (Exception e) {
            throw new RuntimeException("failed to read inference_manager stdout", e);
        }

        // collect stderr for error reporting
        StringBuilder stderr = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                stderr.append(line).append('\n');
            }
        } catch (Exception ignored) {}

        int exitCode;
        try {
            exitCode = process.waitFor();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("interrupted while waiting for inference_manager.py", e);
        }

        if (exitCode != 0) {
            throw new RuntimeException("inference_manager.py exited " + exitCode + ": " + stderr.toString().trim());
        }

        return InferencePayload.Response.fromJson(stdout.toString());
    }
}
