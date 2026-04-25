# Derives per-dimension exclusion bounds from a set of blacklisted PoliVectors
# Given last N disliked politician vectors, finds upper/lower bounds per dimension
# Any candidate vector with a dimension outside those bounds is excluded
# Called by inference_manager.py after userNegPreference samples the blacklist
