ALL FILES SHOULD BE MODULAR AND ONLY CONTAIN SINGULAR LOGIC
Plan extension and relational edge mapping if time permits

/poli
│
├── /backend                   # The "Intelligence" Layer
│   ├── /java-chassis          # The "System Manager" (State & Flow)
│   │   ├── /src/main/java/com/system/
│   │   │   ├── /api           # Data Ingestion ()
│   │   │   ├── /storage       # Persistence (CSV/DB Management)
│   │   │   ├── /sampler       # Sampling (Stochastic/Sliding Window)
│   │   │   ├── /models        # Rigid Objects (MediaVector, Title)
│   │   │   └── /bridge        # IPC (Calling Python Workers)
│   │   └── pom.xml            # Java Dependencies
│   │
│   ├── /inference-engine      # The "Calculators" (Stateless Math)
│   │   ├── /math              # Vector similarity & weights
│   │   ├── /tagger            # LLM Prompting & Audit
│   │   └── requirements.txt   # Python Dependencies
│   │
│   └── /shared                # The "Contracts"
│       ├── taxonomy.json      # Universal definitions for vectors
│       └── vector.schema      # Structural data integrity
│
├── /data                      # The "Knowledge Base" (The State)
│   ├── /cache                 # Raw JSON API dumps
│   ├── global_library.csv     # chng to pinecone or mongoDB
│   └── user_history.csv       # optional user voting preference storage
│
├── /frontend                  # (FOR LATER) The "Interface" Layer
│   ├── /web                   # React/Next.js dashboard
│   └── /mobile                # React Native/Flutter app
│
└── docker-compose.yml         # (Optional) To run everything in sync
