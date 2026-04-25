# Validates LLM-returned allele scores against vector.schema rules
# Checks: all 20 dimensions present (d1–d20), values in range 1.0–5.0, no non-numeric entries
# Called by llm_analyst.py before scores are passed to the PoliVector constructor

_EXPECTED_KEYS = {f"d{i}" for i in range(1, 21)}


def validate_scores(scores: dict) -> None:
    if not isinstance(scores, dict):
        raise ValueError(f"Expected dict, got {type(scores).__name__}")

    missing = _EXPECTED_KEYS - scores.keys()
    if missing:
        raise ValueError(f"Missing dimensions: {sorted(missing)}")

    extra = scores.keys() - _EXPECTED_KEYS
    if extra:
        raise ValueError(f"Unexpected keys: {sorted(extra)}")

    for key in _EXPECTED_KEYS:
        val = scores[key]
        if not isinstance(val, (int, float)):
            raise ValueError(f"{key}: expected float, got {type(val).__name__} ({val!r})")
        if not (1.0 <= val <= 5.0):
            raise ValueError(f"{key}: value {val} out of range [1.0, 5.0]")
