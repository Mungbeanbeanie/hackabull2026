/*
    * Handles like/support sampling — produces the user taste vector and dimension weights
    *
    * Step 1: Pull last N liked politician IDs from user_history.csv (via DataManager)
    * Step 2: Resolve those IDs to actual PoliVectors via LibraryIndexer
    * Step 3: Pass vectors to weight_calculator.py via PythonRunner
    *
    * weight_calculator.py returns two things:
    *   avg_vector — centroid of all liked PoliVectors; THIS becomes the user_vector
    *                fed into cosine_sim.py as the left-hand comparison point
    *   weights    — per-dimension importance (1/σ); alleles consistent across liked
    *                politicians get higher weight in the similarity score
*/
