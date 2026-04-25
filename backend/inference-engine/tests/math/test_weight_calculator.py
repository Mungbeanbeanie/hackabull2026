import json
import subprocess
import sys
import os
import pytest
from weight_calculator import compute, WEIGHT_FLOOR, EPSILON

_MATH_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "math")
_SCRIPT = os.path.join(_MATH_DIR, "weight_calculator.py")


def _run_stdin(payload: dict) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, _SCRIPT],
        input=json.dumps(payload),
        capture_output=True, text=True
    )


def test_single_vector_avg_equals_itself():
    v = [float(i % 5 + 1) for i in range(20)]
    result = compute([v])
    assert result["avg_vector"] == pytest.approx(v, abs=1e-9)


def test_single_vector_weights_at_or_above_floor():
    v = [3.0] * 20
    result = compute([v])
    assert all(w >= WEIGHT_FLOOR for w in result["weights"])


def test_identical_vectors_all_weights_maximum():
    v = [3.0] * 20
    result = compute([v, v])
    expected_max = 1.0 / EPSILON
    for w in result["weights"]:
        assert w == pytest.approx(expected_max, rel=1e-4)


def test_two_opposing_vectors_avg_is_midpoint():
    v1 = [1.0] * 20
    v2 = [5.0] * 20
    result = compute([v1, v2])
    assert result["avg_vector"] == pytest.approx([3.0] * 20, abs=1e-9)


def test_two_opposing_vectors_weights_lower_than_max():
    v1 = [1.0] * 20
    v2 = [5.0] * 20
    result = compute([v1, v2])
    max_weight = 1.0 / EPSILON
    assert all(w < max_weight for w in result["weights"])


def test_avg_vector_has_twenty_elements():
    v = [3.0] * 20
    assert len(compute([v])["avg_vector"]) == 20


def test_stdin_rejects_non_list_vectors():
    proc = _run_stdin({"vectors": "not_a_list"})
    assert proc.returncode != 0
    assert "error" in proc.stderr


def test_stdin_rejects_wrong_length_vector():
    proc = _run_stdin({"vectors": [[1.0] * 19]})
    assert proc.returncode != 0
    assert "error" in proc.stderr
