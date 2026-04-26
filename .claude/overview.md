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

## Feature: Chrome Extension HUD (Hover Card)

### Trigger
- User double-clicks any name on any webpage
- Selected text → checked against politician DB (name match)
- Match found → popup card rendered. No match → silent fail

### Popup Content (in order)
1. **% Match** — cosine similarity vs user's vector; top aligned/misaligned dimensions shown
2. **Top 2 Implemented Policies** — derived from legislative vector (voting record, not promises)
3. **[Stretch]** Mini IV distribution — deprioritized for demo

### Implementation (hackathon scope)
- Extension always-on; activates only on double-click (no full page scan)
- Flow: `selected text → name match → pull 20D vector → cosine_sim → render card`
- Cosine sim runs against stored user_vector (set at install or pulled from main app)

## Hackathon Scope (24hr hard stop)
- DB: 20–50 FL high-profile politicians
- Edges: manually curate top 5 donors/candidate (no live scraper)
- Adherence: global w (not per-dimension) if time-constrained

---

## Build Status

### Implemented
- `taxonomy.json` — 20 planks (p1–p20), scale 1–5, with names and endpoint definitions
- `vector.schema` — 20D JSON schema; fields d1–d20, range 1.0–5.0
- `cosine_sim.py` — weighted cosine similarity over two 20D vectors; reads `{user_vector, poli_vector, weights}` from stdin JSON, returns `{"score": float}`
- `weight_calculator.py` — per-dimension weights via `1/σ` (population std dev) with `EPSILON=1e-6` guard and `WEIGHT_FLOOR=0.1`; reads `{vectors: [...]}`, returns `{"avg_vector": [...], "weights": [...]}`
- `constraint_discoverer.py` — derives per-dimension exclusion bounds from blacklisted PoliVectors
- `prompt_builder.py` — constructs LLM prompt from taxonomy.json plank definitions + figure metadata; returns formatted string for llm_analyst
- `llm_analyst.py` — calls prompt_builder, sends to claude-haiku, strips fences, passes parsed scores to score_validator; returns `{d1..d20: float}`
- `score_validator.py` — validates LLM scores: all 20 keys present, values numeric and in `[1.0, 5.0]`; raises ValueError on violation
- `ApiDispatcher.java` — routes to correct API wrapper(s), merges and normalizes responses
- `PoliVector.java` — 20D policy vector model (d1–d20), immutable, with `toArray()`
- `PoliFigure.java` — full politician object: figure metadata + ID + PoliVector
- `userSupportHistory.java` — logic manager for user history; delegates all reads/writes to DataManager (entry shape: titleId, timestamp, voteStatus, tags)
- `DataManager.java` — sole gatekeeper for CSV reads/writes (later: MongoDB/SQL)
- `QuizEngine.java` — presents 20-plank quiz via stdin; maps answers 1–5 to user_vector scores; skipped/invalid → 3.0 neutral, weight 0.5
- `UserProfile.java` — immutable container for quiz-generated user_vector and weights; passed directly to inference pipeline

### Stubbed (comment-only, no logic yet)
- `inference_manager.py` — main Python orchestration; receives Java bridge input, calls weight_calculator + cosine_sim, returns ranked IDs
- `RequestHandler.java` — HTTP entry point; validates inbound request, delegates to SearchController
- `InferencePayload.java` — IPC data contract for PythonRunner (request: user_vector, candidates, weights, constraints; response: ranked IDs + scores)
- `DemoProfile.java` — hardcoded demo vector + uniform weights for prototype (swapped out when QuizEngine is live)
- `userNegPreference.java` — pulls last 20 explicitly disliked IDs → resolves PoliVectors → input for constraint_discoverer
- `LibraryIndexer.java` — k-d tree spatial index (RAM-only for local dev; swap to Pinecone/Weaviate for prod)
- `SearchController.java` — routes queries to full-library scan, neighborhood, or catalog
- `PythonRunner.java` — Java→Python IPC via stdin/stdout
- `googleCivicInfoApi.java` — maps user location to their specific representatives and districts
- `openStatesApi.java` — all 50 state legislature data; sole source for PoliVector generation via LLM tagging
- `congressGovApi.java` — federal voting records; used for Adherence Scalar comparison only
- `openFecApi.java` — donor/PAC connections; feeds Edge Map directly (no LLM tagging)
- `legiscanApi.java` — raw bill text + granular state-level roll-call voting records
- `wikimediaApi.java` — structured biographical and political history text for LLM enrichment

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