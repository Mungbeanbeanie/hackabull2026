# Build Plan

Ordered by dependency. Each phase unblocks the next.

---

## Phase 1 — Contracts
- [x] `taxonomy.json` — 20 planks (p1–p20), scale 1–5
- [x] `vector.schema` — 20D JSON schema, fields d1–d20, range 1.0–5.0

## Phase 2 — Data Models
- [x] `PoliVector.java` — 20D policy vector (d1–d20)
- [x] `PoliFigure.java` — full politician object (metadata + ID + PoliVector)
- [x] `userSupportHistory.java` — logic manager for user history; calls DataManager for all CSV I/O (add/query/remove entries)

## Phase 3 — Storage
- [x] `DataManager.java` — sole CSV gatekeeper; read/write user_history.csv and politician library

## Phase 4 — API Ingestion
- [x] `ApiDispatcher.java` — route lookups to correct wrapper, merge normalized responses
- [x] `googleCivicInfoApi.java` — map user location to their specific representatives and districts
- [x] `openStatesApi.java` — fetch all 50 state legislature data; sole source for PoliVector generation
- [x] `congressGovApi.java` — federal voting records; used for Adherence Scalar only (not vector generation)
- [x] `openFecApi.java` — donor/PAC connections; feeds Edge Map directly (no LLM tagging)
- [x] `legiscanApi.java` — fetch raw bill texts and granular state-level roll-call voting records
- [x] `wikimediaApi.java` — fetch structured biographical and political history text for LLM enrichment

## Phase 5 — Tagging Pipeline (OpenStates data → PoliVector)
- [x] `prompt_builder.py` — construct LLM prompt from taxonomy.json + OpenStates figure data
- [x] `llm_analyst.py` — call LLM with prompt, return raw plank scores
- [x] `score_validator.py` — validate scores against vector.schema before PoliVector creation

## Phase 6 — Library Index
- [x] `LibraryIndexer.java` — RAM index for PoliFigures; lookups by ID + full candidate list for scoring

## Phase 7 — User Profile
- [x] `QuizEngine.java` — presents 20-plank quiz to user, maps answers to a 20D idealized vector and per-dimension weights
- [x] `UserProfile.java` — stores quiz-generated user_vector + weights; passed directly to inference pipeline
- [x] `DemoProfile.java` — hardcoded demo vector + uniform weights for prototype; swapped out when QuizEngine is live
- [x] `userNegPreference.java` — pull last 20 explicitly disliked IDs → resolve PoliVectors → feed constraint_discoverer

> Note: `userPosPreference.java` is removed — the quiz replaces history-based positive preference sampling.
> `weight_calculator.py` is no longer used for user_vector derivation; weights come from the quiz directly.

## Phase 8 — Python Inference
- [x] `cosine_sim.py` — weighted cosine similarity
- [x] `weight_calculator.py` — per-dimension adherence weights (1/σ from politician's voting history); feeds cosine_sim
- [x] `constraint_discoverer.py` — exclusion bounds from blacklisted vectors
- [x] `inference_manager.py` — orchestrate: pre-filter → cosine_sim → sort → return ranked IDs
  - accepts `use_adherence` boolean flag; passes uniform_weights or adherence_weights to cosine_sim accordingly

## Phase 9 — Java↔Python IPC
- [x] `InferencePayload.java` — request/response data contract for PythonRunner
- [x] `PythonRunner.java` — launch Python scripts, pass payload via stdin, capture stdout

## Phase 10 — Search Orchestration
- [x] `SearchController.java` — route queries (full-library / neighborhood / catalog)

## Phase 11 — HTTP Layer
- [x] `RequestHandler.java` — inbound HTTP gateway; validate request, delegate to SearchController

## Phase 12 — Frontend
- [x] `deskApp` — Still tweak in progress - desktop dashboard (radar chart, scatter plot, edge map)

## Phase 13 — Chrome Extension HUD
- [x] `manifest.json` — declares permissions: `activeTab`, `storage`, `scripting`; content script on `<all_urls>`
- [x] `content.js` — double-click listener; captures selected text, fires name lookup to background
- [x] `background.js` — receives selected text, queries politician DB, returns match + 20D vector
- [X] `cosine_bridge.js` — runs cosine_sim in-extension against stored user_vector (JS port or fetch to local backend)
- [ ] `user_vector_store.js` — stores/retrieves user_vector via `chrome.storage.local`; source TBD (see open questions)
- [ ] `card.html` / `popup.js` — renders hover card: % match, top aligned/misaligned dims, top 2 implemented policies
- [ ] **[Stretch]** mini IV distribution panel in card
