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
- [x] `user_vector_store.js` — stores/retrieves user_vector via `chrome.storage.local`; source TBD (see open questions)
- [x] `card.html` / `popup.js` — renders hover card: % match, top aligned/misaligned dims, top 2 implemented policies
- [x] **[Stretch]** mini IV distribution panel in card

## Phase 14 — MongoDB Setup & Environment
- [x] verify `MONGODB_URI` in `.env` is picked up by LibraryIndexer + DataManager at boot
- [x] verify `GEMINI_API_KEY` in `.env` is available to IngestionRunner → llm_analyst.py subprocess (`genai.Client()` reads this key)
- [ ] confirm LibraryIndexer.loadFromDb() populates RAM index at startup; if empty → SeedData.seed() fires
- [x] remove stale `user_history.csv` reference from overview.md — DataManager is MongoDB-backed

## Phase 15 — Python IPC: CWD Fix + Two Silent Bugs in buildConstraints()
- [x] `pom.xml` — add `<workingDirectory>../../</workingDirectory>` to exec plugin `<configuration>`; sets JVM CWD to project root when `mvn exec:java` runs from `backend/java-chassis/`; all relative Python paths (`backend/inference-engine/...`) currently resolve to wrong location
- [x] `SearchController.java` — fix `root.path("bounds")` → `root.path("constraints")`; `constraint_discoverer.py` returns key `"constraints"`, not `"bounds"`; hate-zone filtering silently produces empty list today
- [x] `SearchController.java` — fix `b.get("dim")` → `b.get("allele")`; `constraint_discoverer.py` returns field `"allele"`, not `"dim"`; would NPE if any constraints were ever found

## Phase 16 — Frontend Environment Wiring
- [x] create `frontend/deskApp/.env.local` with `NEXT_PUBLIC_BACKEND_URL=http://localhost:8080`
- [ ] verify GlobalLoadingScreen correctly reflects `backendOnline` state
- [ ] confirm localSearch fallback uses `vector_stated` when backend offline — intentional for demo resilience

## Phase 17 — Adherence Toggle Correctness
- [ ] `use_adherence=true` currently passes quiz weights as `adherence_weights` — NOT legislative consistency weights
- [ ] fix: run `weight_calculator.py` per politician at IngestionRunner time using stated vs actual vectors as proxy history; store `adherence_weights: float[20]` per politician in MongoDB
- [ ] `LibraryIndexer` — carry and expose `adherence_weights` per figure
- [ ] `SearchController` — pass per-politician adherence weights (not `profile.getWeights()`) when `useAdherence=true`

## Phase 18 — Extension DB Sync
- [ ] `background.js` — add fetch from `http://localhost:8080/api/politicians` on service worker startup; cache in `chrome.storage.local` under key `"politician_db"`
- [ ] `background.js` — read name-match DB from `chrome.storage.local` politician_db first; fall back to bundled 5-record stub if fetch fails

## Phase 19 — Profile Sync: App → Extension
- [ ] deskApp Compare view — add "Export to Extension" action that copies base64 profile code to clipboard (reuse existing `exportProfileCode` from `profile.ts`)
- [ ] extension popup — add input field; user pastes code → `setUserVector(parsed.vector)` via `user_vector_store.js`; reuse `importProfileCode` from `profile.ts` logic (port to JS)
