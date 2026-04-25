# CIVIC INFO SYSTEM — CONTEXT

## Concept
Politicians as software on hardware (donors/networks).
Analyze: Stated Intent vs Functional Output.
Two modules: 20D Vector Space + Weighted Edge Map.

## Feature: 20D Similarity Vector
- Each politician = coordinate in 20D policy space (Fiscal, Civil Liberties, Energy…)
- Theoretical Vector = campaign promises (read-only)
- Legislative Vector = actual voting record
- Cosine Similarity → finds closest neighbors regardless of party
- Display: Radar chart (deep dive) + dimensionality-reduced scatter plot (overview)

## Feature: Adherence Scalar (w ∈ [0,1])
- Measures Δ(Theoretical, Legislative) → "reliability score"
- Practicality Toggle: applies w to 20D vector, physically shifts dot on map
- WOW factor: animate dot moving from stated → actual position

## Feature: Stochastic Edge Map
- Weighted graph of influence infrastructure
- Nodes: Politicians, Super PACs, Corporate Donors, Kinship ties
- Edges: Verifiable only (Money, Employment, Family) — no speculation
- Layout: Radial — politician center (T1), immediate ties (T2), donors (T3/T4)
- Edge thickness = influence volume (w)

## Feature: Trajectory & HUD
- Career prediction: historical pattern matching + fundraising velocity
- Browser ext: entity recognition overlay on articles/emails
- Popup = "Political Nutrition Label":
  - 20D snapshot
  - Red Flag: high-w edges conflicting with article topic
  - Deep-link to full app

## Hackathon Scope (24hr hard stop)
- DB: 20–50 FL high-profile politicians
- Edges: manually curate top 5 donors/candidate (no live scraper)
- Adherence: global w (not per-dimension) if time-constrained