import json
import subprocess
import sys
import os
import pytest
from constraint_discoverer import compute, NUM_CONSTRAINTS

_MATH_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "math")
_SCRIPT = os.path.join(_MATH_DIR, "constraint_discoverer.py")


def _run_stdin(payload: dict) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, _SCRIPT],
        input=json.dumps(payload),
        capture_output=True, text=True
    )


def _make_vec(val: float) -> list:
    return [val] * 20


def test_identical_vectors_lower_equals_upper():
    vectors = [_make_vec(2.0)] * 5
    result = compute(vectors)
    for c in result["constraints"]:
        assert c["lower"] == c["upper"] == pytest.approx(2.0)


def test_identical_vectors_returns_three_constraints():
    vectors = [_make_vec(3.0)] * 3
    result = compute(vectors)
    assert len(result["constraints"]) == NUM_CONSTRAINTS


def test_mixed_vectors_top_three_by_lowest_sigma():
    # dim 0 all same (σ=0), dim 1 spread, rest spread
    v1 = [4.0, 1.0] + [3.0] * 18
    v2 = [4.0, 5.0] + [1.0] * 18
    result = compute([v1, v2])
    alleles = [c["allele"] for c in result["constraints"]]
    assert 0 in alleles  # dim 0 σ=0 must be selected


def test_bounds_are_min_max_of_column():
    v1 = [1.0] * 20
    v2 = [5.0] * 20
    result = compute([v1, v2])
    for c in result["constraints"]:
        assert c["lower"] == pytest.approx(1.0)
        assert c["upper"] == pytest.approx(5.0)


def test_single_vector_lower_equals_upper():
    result = compute([[3.0] * 20])
    for c in result["constraints"]:
        assert c["lower"] == c["upper"]


def test_stdin_rejects_wrong_length_vector():
    proc = _run_stdin({"vectors": [[1.0] * 10]})
    assert proc.returncode != 0
    assert "error" in proc.stderr


def test_stdin_rejects_non_numeric_value():
    vec = [3.0] * 19 + ["bad"]
    proc = _run_stdin({"vectors": [vec]})
    assert proc.returncode != 0
    assert "error" in proc.stderr


def test_stdin_rejects_missing_vectors_key():
    proc = _run_stdin({"data": []})
    assert proc.returncode != 0
    assert "error" in proc.stderr
