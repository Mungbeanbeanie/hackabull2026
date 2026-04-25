## Status: Active

### Task: `ApiDispatcher.java`
- Location: `backend/java-chassis/src/main/java/com/system/api/ApiDispatcher.java`
- Single point of contact between ingestion layer and external APIs
- Routes lookups to the correct wrapper based on data type:
  - `googleCivicInfoApi` — user location → representatives/districts
  - `openStatesApi` — legislative data → PoliVector generation (sole vector source)
  - `congressGovApi` — federal voting records → Adherence Scalar only
  - `openFecApi` — donor/PAC data → Edge Map only
- Merges and normalizes responses into consistent format before passing upstream
- Depends on: all 4 API wrapper stubs
- Needed by: `LibraryIndexer.java`
