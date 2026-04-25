import pytest
from cosine_sim import weighted_cosine, validate

_UNIFORM = [1.0] * 20
_VEC_A = [1.0 if i % 2 == 0 else 0.0 for i in range(20)]
_VEC_B = [0.0 if i % 2 == 0 else 1.0 for i in range(20)]


def test_identical_vectors_score_one():
    v = [3.0] * 20
    assert weighted_cosine(v, v, _UNIFORM) == pytest.approx(1.0, abs=1e-6)


def test_orthogonal_vectors_score_zero():
    score = weighted_cosine(_VEC_A, _VEC_B, _UNIFORM)
    assert score == pytest.approx(0.0, abs=1e-6)


def test_zero_user_vector_returns_zero():
    assert weighted_cosine([0.0] * 20, [3.0] * 20, _UNIFORM) == 0.0


def test_zero_poli_vector_returns_zero():
    assert weighted_cosine([3.0] * 20, [0.0] * 20, _UNIFORM) == 0.0


def test_score_bounded_within_minus_one_to_one():
    v1 = [5.0] * 20
    v2 = [1.0] * 20
    score = weighted_cosine(v1, v2, _UNIFORM)
    assert -1.0 <= score <= 1.0


def test_validate_rejects_short_list():
    with pytest.raises(ValueError, match="user_vector"):
        validate([1.0] * 19, [3.0] * 20, _UNIFORM)


def test_validate_rejects_non_numeric_entry():
    bad = [3.0] * 19 + ["high"]
    with pytest.raises(ValueError):
        validate(bad, [3.0] * 20, _UNIFORM)


def test_validate_rejects_wrong_weights_length():
    with pytest.raises(ValueError, match="weights"):
        validate([3.0] * 20, [3.0] * 20, [1.0] * 10)
