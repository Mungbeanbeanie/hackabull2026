# Main entry point for the Python inference layer — called by PythonRunner.java via stdin
#
# Receives InferencePayload from Java containing:
#   user_vector       — 20D idealized vector from QuizEngine (UserProfile)
#   adherence_weights — per-dimension weights from weight_calculator.py (politician voting consistency)
#   use_adherence     — bool; True = weight by adherence, False = uniform weights
#   constraints       — exclusion bounds from constraint_discoverer.py (built from disliked PoliVectors)
#   candidates        — list of {id, vector} PoliVectors to evaluate
#
# Step 1: Apply constraints to pre-filter candidates (drop any whose allele values fall inside hated bounds)
# Step 2: Pass surviving candidates + user_vector + weights to cosine_sim.py
# Step 3: Sort results by score, filter repeat/stale figures
# Step 4: Return ranked figure IDs + scores to Java layer via stdout


import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "math"))
from cosine_sim import weighted_cosine

VECTOR_LENGTH = 20
TOP_N = 10


def main():
    try:
        payload           = json.loads(sys.stdin.read())
        user_vector       = payload["user_vector"]
        adherence_weights = payload["adherence_weights"]
        use_adherence     = bool(payload.get("use_adherence", False))
        candidates        = payload["candidates"]
        constraints       = payload["constraints"]
        seen_ids          = set(payload.get("seen_ids", []))
    except (json.JSONDecodeError, KeyError) as e:
        print(json.dumps({"error": f"invalid input: {e}"}), file=sys.stderr)
        sys.exit(1)

    if len(user_vector) != VECTOR_LENGTH or len(adherence_weights) != VECTOR_LENGTH:
        print(json.dumps({"error": f"user_vector and adherence_weights must be length {VECTOR_LENGTH}"}), file=sys.stderr)
        sys.exit(1)

    weights = adherence_weights if use_adherence else [1.0] * VECTOR_LENGTH

    # exclude candidates whose allele value falls inside a hate-zone bound
    def in_hate_zone(vec):
        for c in constraints:
            if c["lower"] <= vec[c["allele"]] <= c["upper"]:
                return True
        return False

    survivors = [
        c for c in candidates
        if c["id"] not in seen_ids and not in_hate_zone(c["vector"])
    ]

    # score survivors
    scored = []
    for c in survivors:
        try:
            score = weighted_cosine(user_vector, c["vector"], weights)
            scored.append({"id": c["id"], "score": score})
        except ValueError:
            continue

    scored.sort(key=lambda x: x["score"], reverse=True)
    print(json.dumps({"results": scored[:TOP_N]}))
    sys.exit(0)


if __name__ == "__main__":
    main()

