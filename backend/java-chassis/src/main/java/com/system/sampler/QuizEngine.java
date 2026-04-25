/*
 * Presents 20-plank quiz; maps answers to idealized 20D user_vector + per-dimension weights
 * Skipped/invalid answers default to neutral (3.0) with reduced weight (0.5)
 * Returns UserProfile for direct injection into the inference pipeline
 */

package com.system.sampler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.system.models.UserProfile;

import java.io.File;
import java.util.Scanner;

public class QuizEngine {

    private static final String TAXONOMY_PATH = "backend/shared/taxonomy.json";
    private static final float  SKIP_SCORE    = 3.0f;
    private static final float  SKIP_WEIGHT   = 0.5f;
    private static final float  FULL_WEIGHT   = 1.0f;

    public UserProfile run() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root   = mapper.readTree(new File(TAXONOMY_PATH));
        JsonNode planks = root.has("planks") ? root.get("planks") : root.get("alleles");

        float[] vector  = new float[20];
        float[] weights = new float[20];
        Scanner sc = new Scanner(System.in);

        System.out.println("\n=== Civic Alignment Quiz ===");
        System.out.println("Rate each policy dimension 1-5, or press S to skip.\n");

        for (int i = 0; i < 20; i++) {
            JsonNode plank = planks.get(i);
            String name       = plank.get("name").asText();
            String definition = plank.get("definition").asText();
            String ep1        = plank.get("endpoint_1").asText();
            String ep5        = plank.get("endpoint_5").asText();

            System.out.printf("--- %d/20: %s ---%n", i + 1, name);
            System.out.println(definition);
            System.out.printf("  1 -> %s%n", ep1);
            System.out.printf("  3 -> Neutral%n");
            System.out.printf("  5 -> %s%n", ep5);
            System.out.print("Your answer (1-5 or S to skip): ");

            String input = sc.nextLine().trim().toUpperCase();

            if (input.equals("S") || input.isEmpty()) {
                vector[i]  = SKIP_SCORE;
                weights[i] = SKIP_WEIGHT;
            } else {
                try {
                    int choice = Integer.parseInt(input);
                    if (choice < 1 || choice > 5) throw new NumberFormatException();
                    vector[i]  = choice;
                    weights[i] = FULL_WEIGHT;
                } catch (NumberFormatException e) {
                    System.out.println("Invalid input -- defaulting to neutral (3.0).");
                    vector[i]  = SKIP_SCORE;
                    weights[i] = SKIP_WEIGHT;
                }
            }
            System.out.println();
        }

        sc.close();
        return new UserProfile(vector, weights);
    }
}
