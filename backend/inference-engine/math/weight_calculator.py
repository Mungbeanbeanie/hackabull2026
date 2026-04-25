# Computes per-dimension adherence weights from a politician's voting history vectors
# Input: multiple vector snapshots of a politician's votes over time (from Congress.gov / OpenStates)
# Called by inference_manager.py per politician before cosine_sim is run
#
# Returns two values:
#   avg_vector — politician's average position across their voting history
#   weights    — adherence signal via 1/σ per dimension; low variance = consistent voting = higher weight
#                fed into cosine_sim.py so dimensions where a politician reliably holds their position
#                carry more influence in the final similarity score


import json
import sys
import statistics

VECTOR_LENGTH = 20
EPSILON = 1e-6
WEIGHT_FLOOR = 0.1

def compute(vectors: list) -> dict:
    # Step 3 — compute avg_vector
    n = len(vectors)
    avg_vector = [sum(vec[i] for vec in vectors) / n for i in range(VECTOR_LENGTH)]

    # Step 4 — compute weights via 1/σ (population std dev — we have the full ledger)
    weights = []
    for i in range(VECTOR_LENGTH):
        column = [vec[i] for vec in vectors]
        sigma = statistics.pstdev(column)
        weights.append(max(1.0 / (sigma + EPSILON), WEIGHT_FLOOR)) # makes sure to not delete low weight alleles by adding wieght floor

    return {"avg_vector": avg_vector, "weights": weights}


def main():
    # Step 1 — read stdin parse
    raw = sys.stdin.read()
    data = json.loads(raw)
    vectors = data.get("vectors")

    # Step 2 — validation
    if not vectors or not isinstance(vectors, list):
        print(json.dumps({"error": "vectors must be a non-empty list"}), file=sys.stderr)
        sys.exit(1)

    for i, vec in enumerate(vectors):
        if not isinstance(vec, list) or len(vec) != VECTOR_LENGTH:
            print(json.dumps({"error": f"vector at index {i} must be a list of length {VECTOR_LENGTH}"}), file=sys.stderr)
            sys.exit(1)
        for val in vec:
            if not isinstance(val, (int, float)):
                print(json.dumps({"error": f"non-numeric value in vector at index {i}"}), file=sys.stderr)
                sys.exit(1)

    # Step 5 — output
    result = compute(vectors)
    print(json.dumps(result))
    sys.exit(0)


if __name__ == "__main__":
    main()
