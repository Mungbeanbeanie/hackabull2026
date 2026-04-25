/*
    * The core "Spatial Map." It builds the k-d tree in RAM during boot-up
    * this will only be for local dev and prototyping later when moving to real database chng
    * database will likely be vector db like pinecone or weaviate and this will be replaced by a database manager class that handles all interactions with the vector database
*/

package com.system.managers;

import com.system.models.PoliFigure;
import com.system.models.PoliVector;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LibraryIndexer {

    private final Map<String, PoliFigure> index   = new HashMap<>();
    private final List<PoliFigure>        figures = new ArrayList<>();

    public void addFigure(PoliFigure figure) {
        if (figure == null || figure.id == null) return;
        index.put(figure.id, figure);
        figures.add(figure);
    }

    public PoliFigure lookupById(String id) {
        return index.get(id);
    }

    public PoliVector lookupVector(String id) {
        PoliFigure figure = index.get(id);
        return figure != null ? figure.vector : null;
    }

    public List<PoliFigure> getAllFigures() {
        return Collections.unmodifiableList(figures);
    }

    public int size() {
        return figures.size();
    }
}