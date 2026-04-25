/*
    * class that bundles a figure, their ID, and its Poli_Vector
    * basically full obj of a given figure
*/

package com.system.models;

import java.util.Objects;

public final class PoliFigure {

    public final String id;
    public final String name;
    public final String party;
    public final String state;
    public final String office;
    public final PoliVector vector;

    public PoliFigure(String id, String name, String party, String state, String office, PoliVector vector) {
        this.id = id;
        this.name = name;
        this.party = party;
        this.state = state;
        this.office = office;
        this.vector = vector;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PoliFigure)) return false;
        PoliFigure f = (PoliFigure) o;
        return Objects.equals(id, f.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("PoliFigure{id='%s', name='%s', party='%s', state='%s', office='%s', vector=%s}",
            id, name, party, state, office, vector);
    }
}
