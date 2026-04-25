package com.system.models;

import com.system.storage.DataManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class userSupportHistoryTest {

    @Mock DataManager dataManager;
    userSupportHistory history;

    @BeforeEach
    void setUp() {
        history = new userSupportHistory(dataManager);
    }

    @Test
    void addEntry_delegatesWithCorrectArgs() throws IOException {
        List<String> tags = List.of("tax", "economy");
        history.addEntry("p1", "liked", tags);
        verify(dataManager).appendHistoryEntry(eq("p1"), anyString(), eq("liked"), eq(tags));
    }

    @Test
    void getLikedIds_delegatesWithStatusAndLimit() throws IOException {
        when(dataManager.readHistoryIdsByStatus("liked", 10)).thenReturn(List.of("p1", "p2"));
        List<String> result = history.getLikedIds(10);
        assertThat(result).containsExactly("p1", "p2");
        verify(dataManager).readHistoryIdsByStatus("liked", 10);
    }

    @Test
    void getDislikedIds_delegatesWithStatusAndLimit() throws IOException {
        when(dataManager.readHistoryIdsByStatus("disliked", 5)).thenReturn(List.of("p3"));
        List<String> result = history.getDislikedIds(5);
        assertThat(result).containsExactly("p3");
        verify(dataManager).readHistoryIdsByStatus("disliked", 5);
    }

    @Test
    void removeEntry_delegatesToDelete() throws IOException {
        history.removeEntry("p1");
        verify(dataManager).deleteHistoryEntry("p1");
    }
}
