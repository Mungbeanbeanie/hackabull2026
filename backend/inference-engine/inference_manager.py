# Main Entry Point (Python Layer)
# Manages the full state of an inference request.
# - I/O: Receives raw input from Java bridge (JSON/byte stream with user sample + candidate vectors)
# - Weights: passes cluster multipliers (e.g., Logic Rigidity x1.5, Tone Stability x0.5) to cosine_sim.py
# - Control: Calls cosine_sim.py for core vector similarity (matrix computation)
# - Post: Sorts results, filters old politicians (avoids repeat/stall), 
# - Output: Packages and returns final IDs to Java layer
