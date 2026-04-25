ALL FILES SHOULD BE MODULAR AND ONLY CONTAIN SINGULAR LOGIC
Plan extension and relational edge mapping if time permits

/hackabull2026
│
├── /backend                   # The "Intelligence" Layer
│   ├── /java-chassis          # The "System Manager" (State & Flow)
│   │   ├── /src/main/java/com/system/
│   │   │   ├── /controllers   # Inbound HTTP gateway
│   │   │   │   └── RequestHandler.java  # Receives frontend requests, delegates to SearchController [stub]
│   │   │   ├── /api           # Outbound API clients
│   │   │   │   ├── ApiDispatcher.java   # Routes to correct wrapper, merges normalized responses [stub]
│   │   │   │   ├── BallotpediaApi.java
│   │   │   │   ├── congressGovApi.java
│   │   │   │   ├── googleCivicInfoApi.java
│   │   │   │   ├── openFecApi.java
│   │   │   │   └── proPublicaApi.java
│   │   │   ├── /storage       # Persistence (CSV/DB Management)
│   │   │   │   └── DataManager.java     # Sole gatekeeper for CSV reads/writes [stub]
│   │   │   ├── /sampler       # Sampling
│   │   │   │   ├── userPosPreference.java # Pulls last N liked figures → weights input [stub]
│   │   │   │   └── userNegPreference.java # Pulls last 20 disliked figures → constraint input [stub]
│   │   │   ├── /models        # Rigid Objects
│   │   │   │   ├── PoliVector.java      # 20D policy vector (d1–d20, range 1–5) [stub]
│   │   │   │   ├── PoliFigure.java      # Full politician object (figure + ID + PoliVector) [stub]
│   │   │   │   └── userSupportHistory.java # Maps user_history.csv (titleId, timestamp, vote, tags) [stub]
│   │   │   ├── /managers      # Orchestration / lifecycle managers
│   │   │   │   ├── LibraryIndexer.java  # k-d tree spatial index [stub]
│   │   │   │   └── SearchController.java # Search routing: full-library / neighborhood / catalog [stub]
│   │   │   └── /bridge        # IPC (Calling Python Workers)
│   │   │       ├── PythonRunner.java    # Java→Python stdin/stdout pipe [stub]
│   │   │       └── InferencePayload.java # IPC data contract: request + response models [stub]
│   │   └── pom.xml            # Java Dependencies
│   │
│   ├── /inference-engine      # The "Calculators" (Stateless Math)
│   │   ├── inference_manager.py     # Main Python entry point; orchestrates full inference request
│   │   ├── /math
│   │   │   ├── cosine_sim.py           # 20D weighted cosine similarity
│   │   │   ├── weight_calculator.py    # Per-dimension weights via 1/σ
│   │   │   └── constraint_discoverer.py # Derives exclusion bounds from blacklisted vectors
│   │   ├── /tagging
│   │   │   ├── llm_analyst.py      # Sends prompt to LLM → raw allele scores
│   │   │   ├── prompt_builder.py   # Constructs LLM prompt from taxonomy.json + figure metadata
│   │   │   └── score_validator.py  # Validates LLM scores against vector.schema before PoliVector creation
│   │   └── requirements.txt        # Python Dependencies
│   │
│   └── /shared                # The "Contracts"
│       ├── taxonomy.json      # 20 alleles (p1–p20), scale 1–5, with definitions
│       └── vector.schema      # 20D JSON schema; fields d1–d20, range 1.0–5.0
│
├── /data                      # The "Knowledge Base" (The State)
│   └── /cache
│       ├── /raw               # Raw JSON API dumps
│       └── user_history.csv   # User vote/support history log
│
├── /frontend                  # The "Interface" Layer
│   ├── /deskApp               # Desktop dashboard (Electron/web)
│   └── /extension             # Browser extension (entity overlay)
│
└── docker-compose.yml         # [planned] Run everything in sync
