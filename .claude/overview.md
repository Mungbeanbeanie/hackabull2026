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
- `taxonomy.json` — 20 alleles (p1–p20), scale 1–5, with names and endpoint definitions
- `vector.schema` — 20D JSON schema; fields d1–d20, range 1.0–5.0
- `cosine_sim.py` — weighted cosine similarity over two 20D vectors; reads `{user_vector, poli_vector, weights}` from stdin JSON, returns `{"score": float}`
- `weight_calculator.py` — per-dimension weights via `1/σ` (population std dev) with `EPSILON=1e-6` guard and `WEIGHT_FLOOR=0.1`; reads `{vectors: [...]}`, returns `{"avg_vector": [...], "weights": [...]}`

### Stubbed (comment-only, no logic yet)
- `inference_manager.py` — main Python orchestration; receives Java bridge input, calls weight_calculator + cosine_sim, returns ranked IDs
- `llm_analyst.py` — calls prompt_builder, sends prompt to LLM, passes raw scores to score_validator
- `prompt_builder.py` — constructs LLM prompt from taxonomy.json allele definitions + figure metadata
- `score_validator.py` — validates LLM scores against vector.schema (20 dims, range 1.0–5.0) before PoliVector creation
- `constraint_discoverer.py` — derives per-dimension exclusion bounds from blacklisted PoliVectors
- `RequestHandler.java` — HTTP entry point; validates inbound request, delegates to SearchController
- `ApiDispatcher.java` — routes to correct API wrapper(s), merges and normalizes responses
- `InferencePayload.java` — IPC data contract for PythonRunner (request: user_vector, candidates, weights, constraints; response: ranked IDs + scores)
- `PoliVector.java` — 20D policy vector model (d1–d20)
- `PoliFigure.java` — full politician object: figure metadata + ID + PoliVector
- `userSupportHistory.java` — logic manager for user history; delegates all reads/writes to DataManager (entry shape: titleId, timestamp, voteStatus, tags)
- `DataManager.java` — sole gatekeeper for CSV reads/writes (later: MongoDB/SQL)
- `userPosPreference.java` — pulls last N liked politicians from user_history.csv → input for weight_calculator
- `userNegPreference.java` — pulls last 20 disliked/blacklisted politicians → input for constraint_discoverer
- `LibraryIndexer.java` — k-d tree spatial index (RAM-only for local dev; swap to Pinecone/Weaviate for prod)
- `SearchController.java` — routes queries to full-library scan, neighborhood, or catalog
- `PythonRunner.java` — Java→Python IPC via stdin/stdout
- API wrappers — Ballotpedia, Congress.gov, Google Civic Info, OpenFEC, ProPublica

### Not started
- Frontend: `deskApp`, `extension`
- Data pipeline (no politician records ingested yet; `user_history.csv` exists but empty)

## Data Flow (target)
```
Frontend → RequestHandler → SearchController
                                  ↓
ApiDispatcher → [API wrappers] → raw figure data
                                  ↓
prompt_builder → llm_analyst (LLM) → score_validator → PoliVector → PoliFigure → LibraryIndexer
                                  ↓
user_history.csv → userPosPreference → weight_calculator.py (1/σ weights)
                                  ↓
user_history.csv → userNegPreference → constraint_discoverer.py (exclusion bounds)
                                  ↓
PythonRunner → InferencePayload → inference_manager.py → cosine_sim.py → ranked PoliFigures
```