import json
import os

_shared = os.path.join(os.path.dirname(__file__), "..", "..", "shared")


def _load(filename):
    with open(os.path.join(_shared, filename)) as f:
        return json.load(f)


def test_taxonomy_has_twenty_alleles():
    data = _load("taxonomy.json")
    alleles = data.get("alleles") or data.get("planks")
    assert len(alleles) == 20


def test_taxonomy_alleles_have_required_keys():
    data = _load("taxonomy.json")
    alleles = data.get("alleles") or data.get("planks")
    for plank in alleles:
        for key in ("id", "name", "definition"):
            assert key in plank, f"Missing key '{key}' in plank {plank.get('id')}"


def test_vector_schema_has_twenty_dimensions():
    schema = _load("vector.schema")
    props = schema["properties"]
    assert set(props.keys()) == {f"d{i}" for i in range(1, 21)}


def test_vector_schema_dimensions_have_correct_range():
    schema = _load("vector.schema")
    for key, prop in schema["properties"].items():
        assert prop["minimum"] == 1.0, f"{key} minimum != 1.0"
        assert prop["maximum"] == 5.0, f"{key} maximum != 5.0"


def test_vector_schema_requires_all_dimensions():
    schema = _load("vector.schema")
    required = set(schema["required"])
    assert required == {f"d{i}" for i in range(1, 21)}
