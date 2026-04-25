# Main entry point for the Python inference layer — called by PythonRunner.java via stdin
#
# Receives InferencePayload from Java containing:
#   user_vector   — avg_vector from weight_calculator.py (centroid of liked PoliVectors)
#   weights       — per-dimension weights from weight_calculator.py
#   constraints   — exclusion bounds from constraint_discoverer.py (built from disliked PoliVectors)
#   candidates    — list of PoliVectors to evaluate
#
# Step 1: Apply constraints to pre-filter candidates (drop any whose allele values fall inside hated bounds)
# Step 2: Pass surviving candidates + user_vector + weights to cosine_sim.py
# Step 3: Sort results by score, filter repeat/stale figures
# Step 4: Return ranked figure IDs + scores to Java layer via stdout
