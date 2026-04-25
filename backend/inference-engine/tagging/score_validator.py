# Validates LLM-returned allele scores against vector.schema rules
# Checks: all 20 dimensions present (d1–d20), values in range 1.0–5.0, no non-numeric entries
# Called by llm_analyst.py before scores are passed to the PoliVector constructor
