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
- [x] `DataManager.java` — sole CSV gatekeeper; read/write user_history.csv and politician library

## Phase 4 — API Ingestion
- [x] `ApiDispatcher.java` — route lookups to correct wrapper, merge normalized responses
- [ ] `googleCivicInfoApi.java` — map user location to their specific representatives and districts
- [ ] `openStatesApi.java` — fetch all 50 state legislature data; sole source for PoliVector generation
- [ ] `congressGovApi.java` — federal voting records; used for Adherence Scalar only (not vector generation)
- [ ] `openFecApi.java` — donor/PAC connections; feeds Edge Map directly (no LLM tagging)
- [ ] 'legiscanApi.java' — fetch raw bill texts and granular state-level roll-call voting records; handles deep policy text extraction and supplemental state data
- [ ] 'wikimediaApi.java' — fetch structured biographical and political history text; supplies foundational background context for LLM entity summarization and profile enrichment

## Phase 5 — Tagging Pipeline (OpenStates data → PoliVector)
- [ ] `prompt_builder.py` — construct LLM prompt from taxonomy.json + OpenStates figure data
- [ ] `llm_analyst.py` — call LLM with prompt, return raw allele scores
- [ ] `score_validator.py` — validate scores against vector.schema before PoliVector creation

## Phase 6 — Library Index
- [ ] `LibraryIndexer.java` — build k-d tree from PoliFigures on boot; handle lookups by ID

## Phase 7 — User Profile
- [ ] `QuizEngine.java` — presents 20-allele quiz to user, maps answers to a 20D idealized vector and per-dimension weights
- [ ] `UserProfile.java` — stores quiz-generated user_vector + weights; passed directly to inference pipeline
- [ ] `DemoProfile.java` — hardcoded demo vector + uniform weights for prototype; swapped out when QuizEngine is live
- [ ] `userNegPreference.java` — pull last 20 explicitly disliked IDs → resolve PoliVectors → feed constraint_discoverer

> Note: `userPosPreference.java` is removed — the quiz replaces history-based positive preference sampling.
> `weight_calculator.py` is no longer used for user_vector derivation; weights come from the quiz directly.

## Phase 8 — Python Inference
- [x] `cosine_sim.py` — weighted cosine similarity
- [x] `weight_calculator.py` — per-dimension adherence weights (1/σ from politician's voting history); feeds cosine_sim
- [x] `constraint_discoverer.py` — exclusion bounds from blacklisted vectors
- [ ] `inference_manager.py` — orchestrate: pre-filter → cosine_sim → sort → return ranked IDs
  - accepts `useAdherence` boolean flag; passes uniform_weights or adherence_weights to cosine_sim accordingly

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
