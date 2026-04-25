/*
 * Holds the quiz-generated user_vector and per-dimension weights
 * Passed directly into the inference pipeline (InferencePayload)
 */

package com.system.models;

import java.util.Arrays;

public final class UserProfile {

    private final float[] userVector; // 20D idealized vector (d1–d20), range 1.0–5.0
    private final float[] weights;    // per-dimension confidence weights

    public UserProfile(float[] userVector, float[] weights) {
        if (userVector.length != 20)
            throw new IllegalArgumentException("userVector must have exactly 20 elements");
        if (weights.length != 20)
            throw new IllegalArgumentException("weights must have exactly 20 elements");
        this.userVector = Arrays.copyOf(userVector, 20);
        this.weights    = Arrays.copyOf(weights, 20);
    }

    public float[] getUserVector() { return Arrays.copyOf(userVector, 20); }
    public float[] getWeights()    { return Arrays.copyOf(weights, 20); }
}
