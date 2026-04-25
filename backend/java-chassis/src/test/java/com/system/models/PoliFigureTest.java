package com.system.models;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PoliFigureTest {

    private static PoliVector zeroVec() {
        return new PoliVector(3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                              3, 3, 3, 3, 3, 3, 3, 3, 3, 3);
    }

    @Test
    void constructor_storesAllFields() {
        PoliVector vec = zeroVec();
        PoliFigure f = new PoliFigure("id1", "Alice", "D", "FL", "Senator", vec);
        assertThat(f.id).isEqualTo("id1");
        assertThat(f.name).isEqualTo("Alice");
        assertThat(f.party).isEqualTo("D");
        assertThat(f.state).isEqualTo("FL");
        assertThat(f.office).isEqualTo("Senator");
        assertThat(f.vector).isEqualTo(vec);
    }

    @Test
    void equals_byIdOnly_sameIdDifferentName_isEqual() {
        PoliFigure a = new PoliFigure("id1", "Alice", "D", "FL", "Rep", zeroVec());
        PoliFigure b = new PoliFigure("id1", "Bob",   "R", "GA", "Sen", zeroVec());
        assertThat(a).isEqualTo(b);
    }

    @Test
    void equals_differentId_isNotEqual() {
        PoliFigure a = new PoliFigure("id1", "Alice", "D", "FL", "Rep", zeroVec());
        PoliFigure b = new PoliFigure("id2", "Alice", "D", "FL", "Rep", zeroVec());
        assertThat(a).isNotEqualTo(b);
    }

    @Test
    void hashCode_matchesIdHash() {
        PoliFigure f = new PoliFigure("id1", "Alice", "D", "FL", "Rep", zeroVec());
        assertThat(f.hashCode()).isEqualTo(new PoliFigure("id1", "X", "X", "X", "X", zeroVec()).hashCode());
    }

    @Test
    void toString_containsIdAndName() {
        PoliFigure f = new PoliFigure("id1", "Alice", "D", "FL", "Rep", zeroVec());
        assertThat(f.toString()).contains("id1").contains("Alice");
    }
}
