# Constructs the LLM prompt for allele scoring (refered to as planks in the LLM prompt)
# Injects taxonomy.json allele definitions, figure metadata, and output format instructions
# Returns a formatted prompt string; called by llm_analyst.py before the LLM call

import json
import os

_TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "../../shared/taxonomy.json")


def _load_taxonomy() -> list[dict]:
    with open(_TAXONOMY_PATH, "r") as f:
        return json.load(f)["planks"]


def build_prompt(figure_metadata: dict) -> str:
    """
    figure_metadata keys: name, state, party, bio (str), positions (list[str])
    Returns a prompt string for the LLM to return a JSON object with keys d1–d20.
    """
    planks = _load_taxonomy()

    name      = figure_metadata.get("name", "Unknown")
    state     = figure_metadata.get("state", "Unknown")
    party     = figure_metadata.get("party", "Unknown")
    bio       = figure_metadata.get("bio", "")
    positions = figure_metadata.get("positions", [])

    positions_block = "\n".join(f"- {p}" for p in positions) if positions else "(none provided)"

    plank_lines = []
    for a in planks:
        plank_lines.append(
            f'{a["id"]} | {a["name"]}\n'
            f'  Definition: {a["definition"]}\n'
            f'  Score 1 → {a["endpoint_1"]}\n'
            f'  Score 5 → {a["endpoint_5"]}'
        )
    plank_block = "\n\n".join(plank_lines)

    return f"""You are a nonpartisan political analyst. Score the politician below on each of the 20 policy planks using the provided scale.

## Politician
Name:  {name}
State: {state}
Party: {party}

## Biography
{bio}

## Stated Positions
{positions_block}

## plank Definitions (scale 1–5)
{plank_block}

## Instructions
- Score every plank from 1.0 to 5.0 (floats allowed, e.g. 2.5).
- Base scores strictly on the text above; do not infer from party affiliation alone.
- If evidence for an plank is absent, use 3.0 (neutral).
- Return ONLY a valid JSON object with keys d1 through d20. No prose, no markdown fences, no extra keys.

## Required Output Format
{{
  "d1": <float>,
  "d2": <float>,
  ...
  "d20": <float>
}}"""
