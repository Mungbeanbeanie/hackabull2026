/*
    * obj for allele vector
    * basically stores the 10 values defiend in taxonomy.java
*/

package com.system.models;

import java.util.Objects;

public final class PoliVector {

    public final float d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20;

    public PoliVector(float d1, float d2, float d3, float d4, float d5,
                       float d6, float d7, float d8, float d9, float d10, float d11, float d12, float d13, float d14, float d15,
                       float d16, float d17, float d18, float d19, float d20) {
        this.d1 = d1; this.d2 = d2; this.d3 = d3; this.d4 = d4; this.d5 = d5;
        this.d6 = d6; this.d7 = d7; this.d8 = d8; this.d9 = d9; this.d10 = d10;
        this.d11 = d11; this.d12 = d12; this.d13 = d13; this.d14 = d14; this.d15 = d15;
        this.d16 = d16; this.d17 = d17; this.d18 = d18; this.d19 = d19; this.d20 = d20;
    }

    public float[] toArray() {
        return new float[]{d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20};
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PoliVector)) return false;
        PoliVector v = (PoliVector) o;
        return Float.compare(d1, v.d1) == 0 && Float.compare(d2, v.d2) == 0
            && Float.compare(d3, v.d3) == 0 && Float.compare(d4, v.d4) == 0
            && Float.compare(d5, v.d5) == 0 && Float.compare(d6, v.d6) == 0
            && Float.compare(d7, v.d7) == 0 && Float.compare(d8, v.d8) == 0
            && Float.compare(d9, v.d9) == 0 && Float.compare(d10, v.d10) == 0
            && Float.compare(d11, v.d11) == 0 && Float.compare(d12, v.d12) == 0
            && Float.compare(d13, v.d13) == 0 && Float.compare(d14, v.d14) == 0
            && Float.compare(d15, v.d15) == 0 && Float.compare(d16, v.d16) == 0
            && Float.compare(d17, v.d17) == 0 && Float.compare(d18, v.d18) == 0
            && Float.compare(d19, v.d19) == 0 && Float.compare(d20, v.d20) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20);
    }

    @Override
    public String toString() {
        return String.format("PoliVector{d1=%.2f, d2=%.2f, d3=%.2f, d4=%.2f, d5=%.2f, "
            + "d6=%.2f, d7=%.2f, d8=%.2f, d9=%.2f, d10=%.2f, d11=%.2f, d12=%.2f, d13=%.2f, d14=%.2f, d15=%.2f, "
            + "d16=%.2f, d17=%.2f, d18=%.2f, d19=%.2f, d20=%.2f}",
            d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20);
    }
}