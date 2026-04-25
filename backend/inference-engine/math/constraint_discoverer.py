# Derives per-dimension exclusion bounds from a set of blacklisted PoliVectors
# Given last N disliked politician vectors, finds upper/lower bounds per dimension
# Any candidate vector with a dimension outside those bounds is excluded
# Called by inference_manager.py after userNegPreference samples the blacklist
# passes bound to inference_manager.py to prevent useless math done by cosine_sim.py

import json
import sys
import statistics

VECTOR_LENGTH = 20
NUM_CONSTRAINTS = 3


def main():
    try:
        payload = json.loads(sys.stdin.read())
        vectors = payload["vectors"]
    except (json.JSONDecodeError, KeyError) as e:
        print(json.dumps({"error": f"invalid input: {e}"}), file=sys.stderr)
        sys.exit(1)

    if not vectors or not isinstance(vectors, list):
        print(json.dumps({"error": "vectors must be a non-empty list"}), file=sys.stderr)
        sys.exit(1)

    for i, vec in enumerate(vectors):
        if not isinstance(vec, list) or len(vec) != VECTOR_LENGTH:
            print(json.dumps({"error": f"vector at index {i} must be a list of length {VECTOR_LENGTH}"}), file=sys.stderr)
            sys.exit(1)
        if not all(isinstance(v, (int, float)) for v in vec):
            print(json.dumps({"error": f"non-numeric value in vector at index {i}"}), file=sys.stderr)
            sys.exit(1)

    # find 3 alleles with lowest σ — strongest consistent signal of what's hated
    sigmas = []
    for i in range(VECTOR_LENGTH):
        column = [vec[i] for vec in vectors]
        sigmas.append((statistics.pstdev(column), i))

    sigmas.sort(key=lambda x: x[0])
    top = sigmas[:NUM_CONSTRAINTS]

    constraints = []
    for _, i in top:
        column = [vec[i] for vec in vectors]
        constraints.append({"allele": i, "lower": min(column), "upper": max(column)})

    print(json.dumps({"constraints": constraints}))
    sys.exit(0)


if __name__ == "__main__":
    main()