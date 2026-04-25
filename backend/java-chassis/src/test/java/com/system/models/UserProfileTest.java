package com.system.models;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserProfileTest {

    private static float[] vec(float val) {
        float[] v = new float[20];
        for (int i = 0; i < 20; i++) v[i] = val;
        return v;
    }

    @Test
    void getUserVector_returnsDefensiveCopy() {
        UserProfile p = new UserProfile(vec(3f), vec(1f));
        float[] copy = p.getUserVector();
        copy[0] = 99f;
        assertThat(p.getUserVector()[0]).isEqualTo(3f);
    }

    @Test
    void getWeights_returnsDefensiveCopy() {
        UserProfile p = new UserProfile(vec(3f), vec(1f));
        float[] copy = p.getWeights();
        copy[0] = 99f;
        assertThat(p.getWeights()[0]).isEqualTo(1f);
    }

    @Test
    void getUserVector_hasTwentyElements() {
        assertThat(new UserProfile(vec(3f), vec(1f)).getUserVector()).hasSize(20);
    }

    @Test
    void constructor_rejectsUserVectorNotTwenty() {
        assertThatThrownBy(() -> new UserProfile(new float[19], vec(1f)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("20");
    }

    @Test
    void constructor_rejectsWeightsNotTwenty() {
        assertThatThrownBy(() -> new UserProfile(vec(3f), new float[21]))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("20");
    }
}
