ALL FILES SHOULD BE MODULAR AND ONLY CONTAIN SINGULAR LOGIC
Plan extension and relational edge mapping if time permits

/hackabull2026
│
├── /backend                   # The "Intelligence" Layer
│   ├── /java-chassis          # The "System Manager" (State & Flow)
│   │   ├── /src/main/java/com/system/
│   │   │   ├── /api           # Data Ingestion
│   │   │   │   ├── BallotpediaApi.java
│   │   │   │   ├── congressGovApi.java
│   │   │   │   ├── googleCivicInfoApi.java
│   │   │   │   ├── openFecApi.java
│   │   │   │   └── proPublicaApi.java
│   │   │   ├── /storage       # Persistence (CSV/DB Management)
│   │   │   ├── /sampler       # Sampling (Stochastic/Sliding Window)
│   │   │   ├── /models        # Rigid Objects
│   │   │   │   └── PoliVector.java      # 20D policy vector model [stub]
│   │   │   ├── /managers      # Orchestration / lifecycle managers
│   │   │   │   ├── LibraryIndexer.java  # k-d tree spatial index [stub]
│   │   │   │   └── SearchController.java # search routing logic [stub]
│   │   │   └── /bridge        # IPC (Calling Python Workers)
│   │   │       └── PythonRunner.java    # Java→Python stdin/stdout pipe [stub]
│   │   └── pom.xml            # [planned] Java Dependencies
│   │
│   ├── /inference-engine      # The "Calculators" (Stateless Math)
│   │   ├── /math
│   │   │   ├── cosine_sim.py       # 20D cosine similarity
│   │   │   └── weight_calculator.py # Adherence scalar (w)
│   │   ├── /tagging           # LLM Prompting & Audit
│   │   └── requirements.txt   # [planned] Python Dependencies
│   │
│   └── /shared                # The "Contracts"
│       ├── taxonomy.json      # [planned] Universal definitions for vectors
│       └── vector.schema      # [planned] Structural data integrity
│
├── /data                      # The "Knowledge Base" (The State)
│   └── /cache
│       └── /raw               # Raw JSON API dumps
│
├── /frontend                  # The "Interface" Layer
│   ├── /deskApp               # Desktop dashboard (Electron/web)
│   └── /extension             # Browser extension (entity overlay)
│
└── docker-compose.yml         # [planned] Run everything in sync
