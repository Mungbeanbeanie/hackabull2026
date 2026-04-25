package com.system.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApiDispatcherTest {

    @Mock googleCivicInfoApi civicApi;
    @Mock openStatesApi statesApi;
    @Mock congressGovApi congressApi;
    @Mock openFecApi fecApi;
    @Mock wikimediaApi wikiApi;
    @Mock legiscanApi legiscanApi;

    ApiDispatcher dispatcher;

    @BeforeEach
    void setUp() {
        dispatcher = new ApiDispatcher(civicApi, statesApi, congressApi, fecApi, wikiApi, legiscanApi);
    }

    @Test
    void getRepsByLocation_delegatesToCivicApi() throws IOException {
        when(civicApi.fetchRepresentatives("123 Main St")).thenReturn(List.of("rep1", "rep2"));
        assertThat(dispatcher.getRepsByLocation("123 Main St")).containsExactly("rep1", "rep2");
    }

    @Test
    void getLegislativeData_delegatesToStatesApi() throws IOException {
        Map<String, Object> data = Map.of("key", "value");
        when(statesApi.fetchLegislativeData("pol1")).thenReturn(data);
        assertThat(dispatcher.getLegislativeData("pol1")).isEqualTo(data);
    }

    @Test
    void getFederalVotingRecord_delegatesToCongressApi() throws IOException {
        Map<String, Object> record = Map.of("votes", 42);
        when(congressApi.fetchVotingRecord("bio1")).thenReturn(record);
        assertThat(dispatcher.getFederalVotingRecord("bio1")).isEqualTo(record);
    }

    @Test
    void getDonorConnections_delegatesToFecApi() throws IOException {
        Map<String, Object> donors = Map.of("donor", "corp");
        when(fecApi.fetchDonorConnections("pol1")).thenReturn(donors);
        assertThat(dispatcher.getDonorConnections("pol1")).isEqualTo(donors);
    }

    @Test
    void getBiographyData_delegatesToWikiApi() throws IOException, InterruptedException {
        Map<String, Object> bio = Map.of("born", "1960");
        when(wikiApi.fetchPoliticianSummary("Alice_Smith")).thenReturn(bio);
        assertThat(dispatcher.getBiographyData("Alice_Smith")).isEqualTo(bio);
    }

    @Test
    void getBillDetails_delegatesToLegiscanApi() throws IOException {
        Map<String, Object> bill = Map.of("title", "HR1");
        when(legiscanApi.fetchBill(101)).thenReturn(bill);
        assertThat(dispatcher.getBillDetails(101)).isEqualTo(bill);
    }

    @Test
    void getRollCall_delegatesToLegiscanApi() throws IOException {
        Map<String, Object> roll = Map.of("yeas", 50);
        when(legiscanApi.fetchRollCall(202)).thenReturn(roll);
        assertThat(dispatcher.getRollCall(202)).isEqualTo(roll);
    }
}
