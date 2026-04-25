import pytest
from score_validator import validate_scores


def _valid():
    return {f"d{i}": 3.0 for i in range(1, 21)}


def test_valid_scores_no_exception():
    validate_scores(_valid())


def test_missing_key_raises_with_key_name():
    scores = _valid()
    del scores["d7"]
    with pytest.raises(ValueError, match="d7"):
        validate_scores(scores)


def test_extra_key_raises():
    scores = _valid()
    scores["d21"] = 3.0
    with pytest.raises(ValueError, match="Unexpected"):
        validate_scores(scores)


def test_value_below_range_raises():
    scores = _valid()
    scores["d3"] = 0.9
    with pytest.raises(ValueError, match="d3"):
        validate_scores(scores)


def test_value_above_range_raises():
    scores = _valid()
    scores["d15"] = 5.1
    with pytest.raises(ValueError, match="d15"):
        validate_scores(scores)


def test_string_value_raises_type_error():
    scores = _valid()
    scores["d1"] = "high"
    with pytest.raises(ValueError, match="d1"):
        validate_scores(scores)


def test_non_dict_input_raises():
    with pytest.raises(ValueError, match="dict"):
        validate_scores([3.0] * 20)


def test_boundary_values_accepted():
    scores = {f"d{i}": 1.0 if i <= 10 else 5.0 for i in range(1, 21)}
    validate_scores(scores)
