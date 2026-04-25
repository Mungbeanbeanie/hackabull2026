package com.system.models;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PoliVectorTest {

    private static PoliVector make(float val) {
        return new PoliVector(val, val, val, val, val, val, val, val, val, val,
                              val, val, val, val, val, val, val, val, val, val);
    }

    private static PoliVector distinct() {
        return new PoliVector(1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
                              1, 2, 3, 4, 5, 1, 2, 3, 4, 5);
    }

    @Test
    void constructor_storesAllTwentyDimensions() {
        PoliVector v = new PoliVector(1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
                                     1, 2, 3, 4, 5, 1, 2, 3, 4, 5);
        assertThat(v.d1).isEqualTo(1f);
        assertThat(v.d10).isEqualTo(5f);
        assertThat(v.d20).isEqualTo(5f);
    }

    @Test
    void toArray_returnsTwentyElementsMatchingConstructor() {
        PoliVector v = distinct();
        float[] arr = v.toArray();
        assertThat(arr).hasSize(20);
        assertThat(arr[0]).isEqualTo(v.d1);
        assertThat(arr[19]).isEqualTo(v.d20);
    }

    @Test
    void equals_trueForSameValues() {
        assertThat(make(3f)).isEqualTo(make(3f));
    }

    @Test
    void equals_falseWhenD1Differs() {
        PoliVector a = new PoliVector(1, 2, 3, 4, 5, 1, 2, 3, 4, 5,
                                     1, 2, 3, 4, 5, 1, 2, 3, 4, 5);
        PoliVector b = new PoliVector(9, 2, 3, 4, 5, 1, 2, 3, 4, 5,
                                     1, 2, 3, 4, 5, 1, 2, 3, 4, 5);
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void hashCode_consistentWithEquals() {
        assertThat(make(3f).hashCode()).isEqualTo(make(3f).hashCode());
    }

    @Test
    void toString_containsAllDimensionLabels() {
        String s = make(3f).toString();
        assertThat(s).contains("d1=").contains("d10=").contains("d20=");
    }
}
