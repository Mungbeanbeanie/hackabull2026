# Build Plan

Ordered by dependency. Each phase unblocks the next.

---

## Phase 1 — Contracts
- [x] `taxonomy.json` — 20 alleles (p1–p20), scale 1–5
- [x] `vector.schema` — 20D JSON schema, fields d1–d20, range 1.0–5.0

## Phase 2 — Data Models
- [x] `PoliVector.java` — 20D policy vector (d1–d20)
- [x] `PoliFigure.java` — full politician object (metadata + ID + PoliVector)
- [x] `userSupportHistory.java` — logic manager for user history; calls DataManager for all CSV I/O (add/query/remove entries)

## Phase 3 — Storage
- [ ] `DataManager.java` — sole CSV gatekeeper; read/write user_history.csv and politician library

## Phase 4 — API Ingestion
- [ ] `ApiDispatcher.java` — route lookups to correct wrapper, merge normalized responses
- [ ] `BallotpediaApi.java` — fetch candidate bio + office data
- [ ] `congressGovApi.java` — fetch voting records
- [ ] `googleCivicInfoApi.java` — fetch district/office data
- [ ] `openFecApi.java` — fetch campaign finance data
- [ ] `proPublicaApi.java` — fetch legislative voting history

## Phase 5 — Tagging Pipeline (raw data → PoliVector)
- [ ] `prompt_builder.py` — construct LLM prompt from taxonomy.json + figure metadata
- [ ] `llm_analyst.py` — call LLM with prompt, return raw allele scores
- [ ] `score_validator.py` — validate scores against vector.schema before PoliVector creation

## Phase 6 — Library Index
- [ ] `LibraryIndexer.java` — build k-d tree from PoliFigures on boot; handle lookups by ID

## Phase 7 — Samplers
- [ ] `userPosPreference.java` — pull last N liked IDs → resolve PoliVectors → feed weight_calculator
- [ ] `userNegPreference.java` — pull last 20 disliked IDs → resolve PoliVectors → feed constraint_discoverer

## Phase 8 — Python Inference
- [x] `cosine_sim.py` — weighted cosine similarity
- [x] `weight_calculator.py` — avg_vector (user_vector) + per-dimension weights via 1/σ
- [x] `constraint_discoverer.py` — exclusion bounds from blacklisted vectors
- [ ] `inference_manager.py` — orchestrate: pre-filter → cosine_sim → sort → return ranked IDs

## Phase 9 — Java↔Python IPC
- [ ] `InferencePayload.java` — request/response data contract for PythonRunner
- [ ] `PythonRunner.java` — launch Python scripts, pass payload via stdin, capture stdout

## Phase 10 — Search Orchestration
- [ ] `SearchController.java` — route queries (full-library / neighborhood / catalog)

## Phase 11 — HTTP Layer
- [ ] `RequestHandler.java` — inbound HTTP gateway; validate request, delegate to SearchController

## Phase 12 — Frontend
- [ ] `deskApp` — desktop dashboard (radar chart, scatter plot, edge map)
- [ ] `extension` — browser extension (entity overlay + political nutrition label popup)
