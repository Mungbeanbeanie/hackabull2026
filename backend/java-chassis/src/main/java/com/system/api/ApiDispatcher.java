/*
    * Single point of contact between the ingestion layer and external APIs
    * Routes lookups to the correct API wrapper(s) based on data type and availability
    * Merges and normalizes responses into a consistent format before passing upstream
*/

package com.system.api;

import java.io.IOException;
import java.util.List;
import java.util.Map;

public class ApiDispatcher {

    private final googleCivicInfoApi civicApi;
    private final openStatesApi statesApi;
    private final congressGovApi congressApi;
    private final openFecApi fecApi;

    public ApiDispatcher(googleCivicInfoApi civicApi, openStatesApi statesApi,
                         congressGovApi congressApi, openFecApi fecApi) {
        this.civicApi = civicApi;
        this.statesApi = statesApi;
        this.congressApi = congressApi;
        this.fecApi = fecApi;
    }

    // Google Civic Info → politician IDs for the user's district
    public List<String> getRepsByLocation(String address) throws IOException {
        return civicApi.fetchRepresentatives(address);
    }

    // OpenStates → raw legislative data for a figure; sole input for PoliVector generation
    public Map<String, Object> getLegislativeData(String politicianId) throws IOException {
        return statesApi.fetchLegislativeData(politicianId);
    }

    // Congress.gov → federal voting record; used for Adherence Scalar only, not vector generation
    public Map<String, Object> getFederalVotingRecord(String politicianId) throws IOException {
        return congressApi.fetchVotingRecord(politicianId);
    }

    // OpenFEC → donor/PAC connections; feeds Edge Map directly, no LLM tagging
    public Map<String, Object> getDonorConnections(String politicianId) throws IOException {
        return fecApi.fetchDonorConnections(politicianId);
    }
}
