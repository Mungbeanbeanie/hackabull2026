ALL FILES SHOULD BE MODULAR AND ONLY CONTAIN SINGULAR LOGIC
Plan extension and relational edge mapping if time permits

/hackabull2026
│
├── /backend                   # The "Intelligence" Layer
│   ├── /java-chassis          # The "System Manager" (State & Flow)
│   │   ├── /src/main/java/com/system/
│   │   │   ├── /controllers   # Inbound HTTP gateway
│   │   │   │   └── RequestHandler.java  # Receives frontend requests, delegates to SearchController [implemented]
│   │   │   ├── /api           # Outbound API clients
│   │   │   │   ├── ApiDispatcher.java       # Routes to correct wrapper, merges normalized responses [implemented]
│   │   │   │   ├── congressGovApi.java      # Federal voting records; Adherence Scalar only [implemented]
│   │   │   │   ├── googleCivicInfoApi.java  # Maps user location → representatives/districts [implemented]
│   │   │   │   ├── legiscanApi.java         # Raw bill text + state roll-call voting records [implemented]
│   │   │   │   ├── openFecApi.java          # Donor/PAC connections → Edge Map [implemented]
│   │   │   │   ├── openStatesApi.java       # All 50 state legislature data; sole PoliVector source [implemented]
│   │   │   │   ├── wikimediaApi.java        # Biographical/political history text for LLM enrichment [implemented]
│   │   │   │   └── WikimediaOAuthClient.java # OAuth helper for Wikimedia API [implemented]
│   │   │   ├── /storage       # Persistence (CSV/DB Management)
│   │   │   │   └── DataManager.java     # Sole gatekeeper for CSV reads/writes [implemented]
│   │   │   ├── /sampler       # Sampling
│   │   │   │   ├── QuizEngine.java          # Presents 20-plank quiz → 20D user_vector + weights [implemented]
│   │   │   │   └── userNegPreference.java   # Pulls last 20 disliked figures → constraint input [implemented]
│   │   │   ├── /models        # Rigid Objects
│   │   │   │   ├── PoliVector.java          # 20D policy vector (d1–d20, range 1–5) [implemented]
│   │   │   │   ├── PoliFigure.java          # Full politician object (figure + ID + PoliVector) [implemented]
│   │   │   │   ├── UserProfile.java         # Quiz-generated user_vector + weights [implemented]
│   │   │   │   └── userSupportHistory.java  # Maps user_history.csv (titleId, timestamp, vote, tags) [implemented]
│   │   │   ├── /managers      # Orchestration / lifecycle managers
│   │   │   │   ├── LibraryIndexer.java  # k-d tree spatial index [implemented]
│   │   │   │   └── SearchController.java # Search routing: full-library / neighborhood / catalog [implemented]
│   │   │   └── /bridge        # IPC (Calling Python Workers)
│   │   │       ├── PythonRunner.java    # Java→Python stdin/stdout pipe [implemented]
│   │   │       └── InferencePayload.java # IPC data contract: request + response models [implemented]
│   │   └── pom.xml            # Java Dependencies
│   │
│   ├── /inference-engine      # The "Calculators" (Stateless Math)
│   │   ├── inference_manager.py     # Main Python entry point; orchestrates full inference request
│   │   ├── /math
│   │   │   ├── cosine_sim.py           # 20D weighted cosine similarity [implemented]
│   │   │   ├── weight_calculator.py    # Per-dimension adherence weights via 1/σ [implemented]
│   │   │   └── constraint_discoverer.py # Derives exclusion bounds from blacklisted vectors [implemented]
│   │   ├── /tagging
│   │   │   ├── llm_analyst.py      # Sends prompt to LLM → raw plank scores [implemented]
│   │   │   ├── prompt_builder.py   # Constructs LLM prompt from taxonomy.json + figure metadata [implemented]
│   │   │   └── score_validator.py  # Validates LLM scores against vector.schema before PoliVector creation [implemented]
│   │   └── requirements.txt        # Python Dependencies
│   │
│   └── /shared                # The "Contracts"
│       ├── taxonomy.json      # 20 planks (p1–p20), scale 1–5, with definitions
│       └── vector.schema      # 20D JSON schema; fields d1–d20, range 1.0–5.0
│
├── /data                      # The "Knowledge Base" (The State)
│   └── /cache
│       ├── /raw               # Raw JSON API dumps
│       └── user_history.csv   # User vote/support history log
│
├── /frontend                  # The "Interface" Layer
│   ├── /deskApp               # Desktop dashboard (Electron/web)
│   └── /extension                 # Chrome Extension — HUD Hover Card
│       ├── manifest.json              # MV3 config; registers content script, service worker, popup [implemented]
│       ├── /scripts
│       │   ├── content.js             # Double-click listener only; posts selected text to background [implemented]
│       │   ├── background.js          # Service worker; name lookup + orchestration only [implemented]
│       │   ├── cosine_bridge.js       # Cosine similarity math only; returns % match + dim breakdown [implemented]
│       │   └── user_vector_store.js   # chrome.storage.local get/set for user_vector only [implemented]
│       └── /ui
│           ├── card.html              # Hover card markup only; no logic [implemented]
│           └── popup.js               # Card rendering + data binding only; no math or storage [implemented]
│
└── docker-compose.yml         # [planned] Run everything in sync
