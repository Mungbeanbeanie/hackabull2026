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

---

## Build Status

### Implemented
- `cosine_sim.py` — weighted cosine similarity over two 20D vectors; reads `{user_vector, poli_vector, weights}` from stdin JSON, returns `{"score": float}`
- `weight_calculator.py` — per-dimension weights via `1/σ` (population std dev) with `EPSILON=1e-6` guard and `WEIGHT_FLOOR=0.1`; reads `{vectors: [...]}`, returns `{"avg_vector": [...], "weights": [...]}`

### Stubbed (comment-only, no logic yet)
- `PoliVector.java` — 20D policy vector model
- `LibraryIndexer.java` — k-d tree spatial index (RAM-only for local dev; swap to Pinecone/Weaviate for prod)
- `SearchController.java` — routes queries to full-library scan, neighborhood, or catalog
- `PythonRunner.java` — Java→Python IPC via stdin/stdout
- API wrappers — Ballotpedia, Congress.gov, Google Civic Info, OpenFEC, ProPublica

### Not started
- `taxonomy.json` / `vector.schema` — dimension definitions & validation contracts
- Storage / Sampler packages
- Frontend: `deskApp`, `extension`
- Data pipeline (no politician records ingested yet)

## Data Flow (target)
```
API wrappers → PoliVector (20D) → LibraryIndexer (k-d tree)
                                        ↓
User taste profile → weight_calculator.py (1/σ weights)
                                        ↓
SearchController → PythonRunner → cosine_sim.py → ranked results
```