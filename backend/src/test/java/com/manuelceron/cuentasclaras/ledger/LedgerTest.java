package com.manuelceron.cuentasclaras.ledger;

import com.manuelceron.cuentasclaras.ledger.Ledger.Entry;
import com.manuelceron.cuentasclaras.ledger.Ledger.Transfer;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.assertj.core.api.Assertions.assertThat;

class LedgerTest {

    private static final long ANA = 1, BETO = 2, CAMI = 3, DANI = 4;

    @Test
    void unevenSplitGivesLeftoverUnitsToTheFirstParticipants() {
        var t = Ledger.totals(List.of(ANA, BETO, CAMI), List.of(new Entry(ANA, 100, List.of(ANA, BETO, CAMI))));

        assertThat(t.get(ANA).owed()).isEqualTo(34);
        assertThat(t.get(BETO).owed()).isEqualTo(33);
        assertThat(t.get(CAMI).owed()).isEqualTo(33);
        assertThat(t.get(ANA).paid()).isEqualTo(100);
        assertThat(t.get(ANA).net()).isEqualTo(66);
    }

    @Test
    void settlesATripWithTheExpectedTransfers() {
        // Ana pays 90 000 for the three of them, Beto pays 30 000 for himself and Cami
        var t = Ledger.totals(List.of(ANA, BETO, CAMI), List.of(
                new Entry(ANA, 90_000, List.of(ANA, BETO, CAMI)),
                new Entry(BETO, 30_000, List.of(BETO, CAMI))));
        Map<Long, Long> net = new HashMap<>();
        t.forEach((m, v) -> net.put(m, v.net()));

        // Ana +60 000, Beto -15 000, Cami -45 000
        assertThat(Ledger.settle(net)).containsExactly(new Transfer(CAMI, ANA, 45_000), new Transfer(BETO, ANA, 15_000));
    }

    @Test
    void nobodyOwesAnythingWhenEveryonePaidTheirShare() {
        assertThat(Ledger.settle(Map.of(ANA, 0L, BETO, 0L))).isEmpty();
    }

    @Test
    void randomGroupsAlwaysBalanceToZeroInAtMostNMinusOneTransfers() {
        Random r = new Random(42);
        List<Long> members = List.of(ANA, BETO, CAMI, DANI);
        for (int round = 0; round < 500; round++) {
            List<Entry> entries = new java.util.ArrayList<>();
            for (int i = 0; i < 1 + r.nextInt(8); i++) {
                List<Long> who = members.stream().filter(m -> r.nextBoolean()).toList();
                if (who.isEmpty()) who = List.of(ANA);
                entries.add(new Entry(members.get(r.nextInt(4)), 1 + r.nextInt(1_000_000), who));
            }
            var totals = Ledger.totals(members, entries);
            long spent = entries.stream().mapToLong(Entry::amount).sum();
            assertThat(totals.values().stream().mapToLong(Ledger.Totals::owed).sum()).isEqualTo(spent);

            Map<Long, Long> net = new HashMap<>();
            totals.forEach((m, v) -> net.put(m, v.net()));
            List<Transfer> plan = Ledger.settle(net);
            assertThat(plan.size()).isLessThanOrEqualTo(members.size() - 1);

            // applying the plan leaves every balance at zero
            for (Transfer tr : plan) {
                assertThat(tr.amount()).isPositive();
                net.merge(tr.from(), tr.amount(), Long::sum);
                net.merge(tr.to(), -tr.amount(), Long::sum);
            }
            assertThat(net.values()).allMatch(v -> v == 0);
        }
    }
}
