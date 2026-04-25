/*
 * Holds the quiz-generated user_vector and per-dimension weights
 * Passed directly into the inference pipeline (InferencePayload)
 */

package com.system.models;

public final class UserProfile {

    public final float[] userVector; // 20D idealized vector (d1–d20), range 1.0–5.0
    public final float[] weights;    // per-dimension confidence weights

    public UserProfile(float[] userVector, float[] weights) {
        this.userVector = userVector;
        this.weights    = weights;
    }
}
