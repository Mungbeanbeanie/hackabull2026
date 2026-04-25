package com.system.sampler;

import com.system.models.UserProfile;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Scanner;

import static org.assertj.core.api.Assertions.assertThat;

class QuizEngineTest {

    private static String buildMinimalTaxonomy() {
        StringBuilder sb = new StringBuilder("{\"alleles\":[");
        for (int i = 1; i <= 20; i++) {
            if (i > 1) sb.append(",");
            sb.append(String.format(
                "{\"id\":\"p%d\",\"name\":\"P%d\",\"definition\":\"def%d\","
                + "\"endpoint_1\":\"e1_%d\",\"endpoint_5\":\"e5_%d\"}",
                i, i, i, i, i));
        }
        sb.append("]}");
        return sb.toString();
    }

    private static QuizEngine engine(Path dir) throws Exception {
        Path tax = dir.resolve("taxonomy.json");
        Files.writeString(tax, buildMinimalTaxonomy());
        return new QuizEngine(tax.toString());
    }

    private static Scanner scanner(String answers) {
        return new Scanner(new ByteArrayInputStream(answers.getBytes()));
    }

    @Test
    void skip_setsNeutralScoreAndReducedWeight(@TempDir Path dir) throws Exception {
        String answers = "S\n".repeat(20);
        UserProfile p = engine(dir).run(scanner(answers));
        assertThat(p.getUserVector()[0]).isEqualTo(3.0f);
        assertThat(p.getWeights()[0]).isEqualTo(0.5f);
    }

    @Test
    void validAnswer_storesExactScoreAndFullWeight(@TempDir Path dir) throws Exception {
        String answers = "4\n".repeat(20);
        UserProfile p = engine(dir).run(scanner(answers));
        assertThat(p.getUserVector()[0]).isEqualTo(4.0f);
        assertThat(p.getWeights()[0]).isEqualTo(1.0f);
    }

    @Test
    void invalidInput_defaultsToNeutral(@TempDir Path dir) throws Exception {
        String answers = "X\n".repeat(20);
        UserProfile p = engine(dir).run(scanner(answers));
        assertThat(p.getUserVector()[0]).isEqualTo(3.0f);
        assertThat(p.getWeights()[0]).isEqualTo(0.5f);
    }

    @Test
    void outOfRangeInput_defaultsToNeutral(@TempDir Path dir) throws Exception {
        String answers = "9\n".repeat(20);
        UserProfile p = engine(dir).run(scanner(answers));
        assertThat(p.getUserVector()[0]).isEqualTo(3.0f);
        assertThat(p.getWeights()[0]).isEqualTo(0.5f);
    }

    @Test
    void run_returnsProfileWithTwentyElements(@TempDir Path dir) throws Exception {
        String answers = "3\n".repeat(20);
        UserProfile p = engine(dir).run(scanner(answers));
        assertThat(p.getUserVector()).hasSize(20);
        assertThat(p.getWeights()).hasSize(20);
    }
}
