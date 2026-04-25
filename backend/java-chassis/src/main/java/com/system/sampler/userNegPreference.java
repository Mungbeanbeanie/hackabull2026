/*
    * Handles dislike/blacklist sampling — produces the exclusion signal
    *
    * Step 1: Pull last 20 disliked politician IDs from user_history.csv (via DataManager)
    * Step 2: Resolve those IDs to actual PoliVectors via LibraryIndexer
    * Step 3: Pass vectors to constraint_discoverer.py via PythonRunner
    *
    * constraint_discoverer.py finds the 3 alleles with lowest σ across those vectors
    * (most consistent signal of what the user hates) and returns lower/upper bounds per allele.
    * inference_manager.py uses those bounds to pre-filter candidates BEFORE cosine_sim runs —
    * any candidate whose value falls inside a hated range is dropped without touching cosine math.
*/