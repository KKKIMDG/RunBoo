package com.runboo.domain.ai.service;

import com.runboo.domain.ai.entity.UserAiStatus;
import com.runboo.domain.ai.repository.UserAiStatusRepository;
import com.runboo.domain.record.service.AiCoachingService;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@EnabledIfEnvironmentVariable(named = "RUNBOO_AI_POSTGRES_TEST", matches = "true")
@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:postgresql://127.0.0.1:55439/runboo_ai_test",
        "spring.datasource.username=postgres",
        "spring.datasource.password=runboo-local-test",
        "spring.jpa.hibernate.ddl-auto=create-drop"
}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(AiAnalysisService.class)
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class AiAnalysisConcurrencyTest {

    @Autowired private AiAnalysisService service;
    @Autowired private UserRepository users;
    @Autowired private UserAiStatusRepository statuses;
    @Autowired private JdbcTemplate jdbc;
    @MockBean private AiCoachingService coaching;

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void oneRemainingTicketAllowsOnlyOneAiCall(boolean statusExists) throws Exception {
        Long userId = createUser(statusExists);
        CountDownLatch firstAiCall = new CountDownLatch(1);
        CountDownLatch releaseFirst = new CountDownLatch(1);
        AtomicInteger aiCalls = new AtomicInteger();
        when(coaching.getMonthlyAnalysisPrompt(userId)).thenReturn("prompt");
        when(coaching.analyze("prompt")).thenAnswer(invocation -> {
            if (aiCalls.incrementAndGet() == 1) {
                firstAiCall.countDown();
                if (!releaseFirst.await(10, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("Test did not release the first AI call");
                }
            }
            return "analysis";
        });

        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> service.analyzeRecords(userId));
            try {
                assertThat(firstAiCall.await(5, TimeUnit.SECONDS)).isTrue();
                var second = executor.submit(() -> service.analyzeRecords(userId));
                // Wait for the race to occur (old implementation) or for PostgreSQL to block it.
                long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
                while (!second.isDone() && !hasBlockedTransaction() && System.nanoTime() < deadline) {
                    Thread.sleep(20);
                }
                assertThat(second.isDone() || hasBlockedTransaction())
                        .as("The second request reached PostgreSQL while the first call was open")
                        .isTrue();
                releaseFirst.countDown();

                assertThat(first.get(5, TimeUnit.SECONDS).getRemainingCount()).isZero();
                assertThatThrownBy(() -> second.get(5, TimeUnit.SECONDS))
                        .isInstanceOf(ExecutionException.class)
                        .hasCauseInstanceOf(IllegalStateException.class);
            } finally {
                releaseFirst.countDown();
            }
        }

        assertThat(aiCalls.get()).isEqualTo(1);
        assertThat(statuses.findByUserId(userId).orElseThrow().getRemainingCount()).isZero();
    }

    @Test
    void noRunningRecordsDoesNotConsumeTicket() {
        Long userId = createUser(true);
        when(coaching.getMonthlyAnalysisPrompt(userId)).thenReturn(null);

        assertThat(service.analyzeRecords(userId).getRemainingCount()).isEqualTo(1);
        verify(coaching, never()).analyze(anyString());
        assertThat(statuses.findByUserId(userId).orElseThrow().getRemainingCount()).isEqualTo(1);
    }

    @Test
    void aiFailureDoesNotConsumeTicket() {
        Long userId = createUser(true);
        when(coaching.getMonthlyAnalysisPrompt(userId)).thenReturn("prompt");
        when(coaching.analyze("prompt")).thenThrow(new IllegalStateException("AI unavailable"));

        assertThatThrownBy(() -> service.analyzeRecords(userId)).hasMessage("AI unavailable");
        assertThat(statuses.findByUserId(userId).orElseThrow().getRemainingCount()).isEqualTo(1);
    }

    private Long createUser(boolean statusExists) {
        User user = users.save(User.createLocal(UUID.randomUUID() + "@example.test", "unused", "runner"));
        if (statusExists) {
            statuses.save(new UserAiStatus(user));
        }
        return user.getId();
    }

    private boolean hasBlockedTransaction() {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                select exists (
                    select 1 from pg_stat_activity
                    where datname = current_database() and cardinality(pg_blocking_pids(pid)) > 0
                )
                """, Boolean.class));
    }
}
