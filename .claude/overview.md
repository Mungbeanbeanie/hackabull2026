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
- Measures Δ(Theoretical Vector, Legislative Vector) → "reliability score"
- Theoretical Vector = LLM-tagged PoliVector from OpenStates stated positions
- Legislative Vector = avg_vector from weight_calculator.py (centroid of actual voting history)
- Per-dimension adherence weights = 1/σ across voting history; consistent dimensions weighted higher

### Toggle Mechanic
- **Toggle OFF (default):** cosine_sim(user_vector, poli_vector, uniform_weights) — pure position alignment; "who says they agree with you"
- **Toggle ON:** cosine_sim(user_vector, poli_vector, adherence_weights) — consistency-weighted; "who actually follows through"
- cosine_sim.py is unchanged — inference_manager.py switches which weights it passes based on the toggle flag
- WOW factor: animate dot moving from stated → actual position as toggle turns on

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
- `QuizEngine.java` — presents 20-allele quiz, maps answers to a 20D idealized user_vector + per-dimension weights
- `UserProfile.java` — holds quiz-generated user_vector and weights; passed directly to inference pipeline
- `DemoProfile.java` — hardcoded demo vector + uniform weights for prototype (swapped out when QuizEngine is live)
- `userNegPreference.java` — pulls last 20 explicitly disliked IDs → resolves PoliVectors → input for constraint_discoverer
- `LibraryIndexer.java` — k-d tree spatial index (RAM-only for local dev; swap to Pinecone/Weaviate for prod)
- `SearchController.java` — routes queries to full-library scan, neighborhood, or catalog
- `PythonRunner.java` — Java→Python IPC via stdin/stdout
- `googleCivicInfoApi.java` — maps user location to their specific representatives and districts
- `openStatesApi.java` — all 50 state legislature data; sole source for PoliVector generation via LLM tagging
- `congressGovApi.java` — federal voting records; used for Adherence Scalar comparison only
- `openFecApi.java` — donor/PAC connections; feeds Edge Map directly (no LLM tagging)

### Not started
- Frontend: `deskApp`, `extension`
- Data pipeline (no politician records ingested yet; `user_history.csv` exists but empty)

## Data Flow (target)
```
Frontend → RequestHandler → SearchController

── Ingestion (one-time / on-demand) ──────────────────────────────────────────
googleCivicInfoApi  →  user location → rep/district lookup
openStatesApi       →  legislative data → prompt_builder → llm_analyst (LLM)
                                            → score_validator → PoliVector → PoliFigure → LibraryIndexer
congressGovApi      →  federal voting records → Adherence Scalar (comparison only, not vector input)
openFecApi          →  donor/PAC data → Edge Map (no LLM tagging)

── Query (per request) ────────────────────────────────────────────────────────
QuizEngine / DemoProfile    →  user_vector (idealized, quiz-generated)
politician voting history   →  weight_calculator.py → adherence_weights + avg_vector (legislative centroid)
user_history.csv → userNegPreference → constraint_discoverer.py → exclusion bounds
                                              ↓
                         PythonRunner → InferencePayload → inference_manager.py
                                              ↓                          ↓
                                toggle=OFF: uniform_weights     toggle=ON: adherence_weights
                                              ↓                          ↓
                                         cosine_sim.py → ranked PoliFigures
```