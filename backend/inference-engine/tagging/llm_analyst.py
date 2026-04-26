import json
import os
import re
import sys
from google import genai
from google.genai import types

# Ensure local modules are accessible
sys.path.insert(0, os.path.dirname(__file__))

from prompt_builder import build_prompt
import score_validator

_MODEL = "gemini-3-flash"

_client = genai.Client()


def _extract_json(text: str) -> str:
    """Remove markdown fences if the model adds them."""
    text = text.strip()

    # Remove ```json or ``` wrappers
    text = re.sub(r"^```(?:json)?", "", text)
    text = re.sub(r"```$", "", text)

    return text.strip()


def analyze(figure_metadata: dict) -> dict:
    """
    figure_metadata: {name, state, party, bio, positions}
    Returns validated score dict {d1: float, ..., d20: float}
    """

    # 1. Build prompt
    prompt = build_prompt(figure_metadata)

    # 2. Call Gemini (JSON mode)
    response = _client.models.generate_content(
        model=_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        ),
    )

    # 3. Extract raw text
    raw_text = getattr(response, "text", None)
    if raw_text is None:
        raise ValueError("Model returned no text output")

    # 4. Clean JSON
    clean_json = _extract_json(raw_text)

    # 5. Parse JSON
    try:
        data = json.loads(clean_json)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from model:\n{clean_json}") from e

    # 6. Validate scores (FIXED NAME)
    validated = score_validator.validate_scores(data)

    return validated


# Entry point for Java subprocess execution
if __name__ == "__main__":
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)

        # Run analysis
        result = analyze(input_data)

        # Output JSON to stdout
        print(json.dumps(result))

    except Exception as e:
        # Return structured error (important for Java side)
        error_output = {
            "error": str(e)
        }
        print(json.dumps(error_output))
        sys.exit(1)