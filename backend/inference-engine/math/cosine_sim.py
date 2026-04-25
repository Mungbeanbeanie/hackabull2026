# just a vector multiplier
# takes given vectors and finds the cosine similarity between them
# The core math utility that calculates the "Distance" between your taste and a potential poli
# used for the actual recommendation engine

import json
import math
import sys

VECTOR_LENGTH = 20

def vaidate(user_vector, poli_vector, weights):
    for name, vec in [("user_vector", user_vector), ("poli_vector", poli_vector), ("weights", weights)]:
        if not isinstance(vec, list) or len(vec) != VECTOR_LENGTH:
            raise ValueError(f"{name} must be a list of length {VECTOR_LENGTH}")
        if not all(isinstance(v, (int, float)) for v in vec):
            raise ValueError(f"{name} contains non-numeric values")

def weighted_cosine(user_vector, poli_vector, weights):
    numerator = sum(w * u * m for w, u, m in zip(weights, user_vector, poli_vector))
    denom_user = math.sqrt(sum(w * u ** 2 for w, u in zip(weights, user_vector)))
    denom_media = math.sqrt(sum(w * m ** 2 for w, m in zip(weights, poli_vector)))

    if denom_user == 0 or denom_media == 0:
        return 0.0

    score = numerator / (denom_user * denom_media)
    return min(1.0, max(-1.0, score))


def main():
    try:
        payload = json.loads(sys.stdin.read())
        user_vector = payload["user_vector"]
        poli_vector = payload["poli_vector"]
        weights = payload["weights"]
    except (json.JSONDecodeError, KeyError) as e:
        print(json.dumps({"error": f"invalid input: {e}"}), file=sys.stderr)
        sys.exit(1)

    try:
        validate(user_vector, poli_vector, weights)
    except ValueError as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

    score = weighted_cosine(user_vector, poli_vector, weights)
    print(json.dumps({"score": round(score, 6)}))
    sys.exit(0)


if __name__ == "__main__":
    main()