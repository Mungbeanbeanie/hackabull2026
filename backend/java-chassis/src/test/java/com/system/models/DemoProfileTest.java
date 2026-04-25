package com.system.models;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DemoProfileTest {

    @Test
    void get_returnsUserProfile() {
        assertThat(DemoProfile.get()).isNotNull();
    }

    @Test
    void get_vectorHasTwentyElements() {
        assertThat(DemoProfile.get().getUserVector()).hasSize(20);
    }

    @Test
    void get_vectorAllMidpoint() {
        for (float v : DemoProfile.get().getUserVector())
            assertThat(v).isEqualTo(3.0f);
    }

    @Test
    void get_weightsAllUniform() {
        for (float w : DemoProfile.get().getWeights())
            assertThat(w).isEqualTo(1.0f);
    }

    @Test
    void get_returnsFreshInstanceEachCall() {
        assertThat(DemoProfile.get()).isNotSameAs(DemoProfile.get());
    }

    @Test
    void get_vectorIsMutable_doesNotAffectNext() {
        float[] vec = DemoProfile.get().getUserVector();
        vec[0] = 99f;
        assertThat(DemoProfile.get().getUserVector()[0]).isEqualTo(3.0f);
    }
}
