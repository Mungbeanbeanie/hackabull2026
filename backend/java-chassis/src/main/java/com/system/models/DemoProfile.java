/*
 * Hardcoded prototype profile: midpoint vector (3.0) + uniform weights (1.0).
 * Swap out for QuizEngine.java when live user input is available.
 */

package com.system.models;

import java.util.Arrays;

public final class DemoProfile {

    private static final float[] DEMO_VECTOR;
    private static final float[] UNIFORM_WEIGHTS;

    static {
        DEMO_VECTOR     = new float[20];
        UNIFORM_WEIGHTS = new float[20];
        Arrays.fill(DEMO_VECTOR,     3.0f);
        Arrays.fill(UNIFORM_WEIGHTS, 1.0f);
    }

    private DemoProfile() {}

    public static UserProfile get() {
        return new UserProfile(DEMO_VECTOR, UNIFORM_WEIGHTS);
    }
}
