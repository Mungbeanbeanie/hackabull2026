# The script that sends metadata + taxonomy.json to chosen LLM to generate scores
# The LLM will return a list of scores for each "allele", which will
# be used to create the vector for the figure

import json
import os
import re
import sys

import anthropic

sys.path.insert(0, os.path.dirname(__file__))
from prompt_builder import build_prompt
import score_validator

_MODEL = "claude-haiku-4-5-20251001"
_client = anthropic.Anthropic()


def analyze(figure_metadata: dict) -> dict:
    """
    figure_metadata: {name, state, party, bio, positions}
    Returns validated score dict {d1: float, ..., d20: float}
    """
    prompt = build_prompt(figure_metadata)

    response = _client.messages.create(
        model=_MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw, flags=re.DOTALL).strip()

    scores = json.loads(raw)
    score_validator.validate_scores(scores)
    return scores
