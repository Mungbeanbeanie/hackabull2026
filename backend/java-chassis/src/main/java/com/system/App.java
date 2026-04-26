package com.system;

import com.system.bridge.PythonRunner;
import com.system.controllers.RequestHandler;
import com.system.managers.LibraryIndexer;
import com.system.managers.SearchController;
import com.system.sampler.userNegPreference;
import com.system.storage.DataManager;

public class App {

    public static void main(String[] args) throws Exception {
        EnvLoader.load();

        int port = 8080;
        String envPort = System.getenv("PORT");
        if (envPort != null && !envPort.isBlank()) {
            port = Integer.parseInt(envPort.trim());
        }

        DataManager       dataManager  = new DataManager();
        LibraryIndexer    indexer      = new LibraryIndexer();
        if (indexer.size() == 0) SeedData.seed(indexer);
        PythonRunner      python       = new PythonRunner();
        userNegPreference negPref      = new userNegPreference(dataManager, indexer, python);
        SearchController  controller   = new SearchController(indexer, negPref, python);
        RequestHandler    handler      = new RequestHandler(controller, port);

        Runtime.getRuntime().addShutdownHook(new Thread(handler::stop));

        handler.start();
        System.out.println("SERVER_PORT=" + handler.getPort());
    }
}
